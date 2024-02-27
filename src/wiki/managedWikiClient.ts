import {RedditAPIClient, RedisClient, Subreddit, User, WikiPage, WikiPagePermissionLevel} from "@devvit/public-api";
import {WikiPath} from "./wikiPath.js";
import {SafeWikiClient} from "./safeWikiClient.js";
import {CreateWikiPageResult, EditWikiPageResult} from "./wikiTypes.js";
import {isBanned, isWikiBanned} from "devvit-helpers";

export class ManagedWikiClient {
    public defaultListed = true;
    public deletedPageContent = "[deleted]";

    protected safeWikiClient: SafeWikiClient;
    constructor (protected reddit: RedditAPIClient, protected redis: RedisClient, protected subreddit: Subreddit) {
        console.log(`ManagedWikiClient constructor for /r/${subreddit.name}`);
        this.safeWikiClient = new SafeWikiClient(reddit);
    }

    get subredditName () {
        return this.subreddit.name;
    }

    public async isManagedWikiPage (wikiPath: WikiPath): Promise<boolean> {
        return !!await this.redis.get(`wiki:${wikiPath.treeRoot}:owner`);
    }

    public async getOwnedWikiPages (userId: string): Promise<WikiPath[]> {
        const wikiPages = await this.redis.zRange(`user:${userId}:ownedWikiPages`, 0, -1, {by: "rank"});
        return wikiPages.map(wikiPage => new WikiPath(wikiPage.member));
    }

    public async getEditorWikiPages (userId: string): Promise<WikiPath[]> {
        const wikiPages = await this.redis.zRange(`user:${userId}:editorWikiPages`, 0, -1, {by: "rank"});
        return wikiPages.map(wikiPage => new WikiPath(wikiPage.member));
    }

    /**
     * Gets the owner of a wiki page based on its path. The owner is the user who created the root page in the wiki tree.
     * @param {WikiPath} wikiPath
     * @returns {string | undefined} The owner's user ID, or undefined if the owner is not set.
     */
    public async getWikiPageOwner (wikiPath: WikiPath): Promise<string | undefined> {
        return this.redis.get(`wiki:${wikiPath.treeRoot}:owner`);
    }

    /**
     * Gets the editors of a wiki page based on its path. The editors are based on Redis and not the actual wiki page. The owner is not included in the list of editors.
     * @param {WikiPath} wikiPath
     * @returns {string[]} The user IDs of the editors.
     */
    public async getWikiPageEditors (wikiPath: WikiPath): Promise<string[]> {
        const wikiPageEditors = await this.redis.zRange(`wiki:${wikiPath.path}:editors`, 0, -1, {by: "rank"});
        return wikiPageEditors.map(editor => editor.member);
    }

    /**
     * This function will attempt to create a wiki page for the desired owner. The function checks if the page already exists or if it's already owned by someone else.
     * @param {WikiPath} wikiPath Path of the wiki page to create.
     * @param {User} owner Desired owner of the wiki page.
     * @returns {CreateWikiPageResult} Returns the result of the attempted page creation.
     */
    public async createWikiPage (wikiPath: WikiPath, owner: User): Promise<CreateWikiPageResult> {
        const watchedKeys = [`wiki:${wikiPath.path}:owner`];
        if (!wikiPath.isTreeRoot) {
            watchedKeys.push(`wiki:${wikiPath.treeRoot}:owner`);
        }
        // Using transactions might prevent issues if two users try to create the same wiki page at the same time.
        const tx = await this.redis.watch(...watchedKeys);

        // Check if the wiki page or its root is already owned by someone else.
        const existingOwners = await this.redis.mget(watchedKeys);
        for (const existingOwner of existingOwners) {
            if (existingOwner && existingOwner !== owner.id) {
                // await tx.unwatch(); // not implemented?
                return "alreadyOwned";
            }
        }

        await tx.multi();

        // Set the owner of the wiki page and its root.
        const watchedKeysObject = Object.fromEntries(watchedKeys.map(key => [key, owner.id]));
        await tx.mset(watchedKeysObject);

        // Add the wiki page to the owner's list of owned wiki pages.
        await tx.zAdd(`user:${owner.id}:ownedWikiPages`, {score: Date.now(), member: wikiPath.path});

        try {
            const execResult = await tx.exec();
            if (!execResult) {
                console.log(`Transaction failed while creating wiki page (${wikiPath.path}) in createWikiPage`);
                return "errorRedis";
            }
        } catch (error) {
            console.log("Exec error while creating wiki page", error);
            return "errorRedis";
        }

        // Check if the wiki page already exists.
        const existingWikiPage = await this.safeWikiClient.getWikiPage(this.subreddit.name, wikiPath.path);
        if (existingWikiPage) {
            await this.configureWikiPage(existingWikiPage);
            await existingWikiPage.addEditor(owner.username);
            return "alreadyCreated";
        }

        const createdWikiPage = await this.safeWikiClient.createWikiPage({
            subredditName: this.subreddit.name,
            page: wikiPath.path,
            content: "---",
            reason: "WikiAssistant - createWikiPage",
        });
        if (!createdWikiPage) {
            console.warn(`Failed to create wiki page (${wikiPath.path}) in createWikiPage`);
            return "errorWiki";
        }

        try {
            await this.configureWikiPage(createdWikiPage);
            await createdWikiPage.addEditor(owner.username);
        } catch (error) {
            console.warn(`Failed to configure wiki page (${wikiPath.path}) in createWikiPage`, error);
            return "errorWiki";
        }
        return "success";
    }

    public async addWikiPageEditor (wikiPath: WikiPath, editor: User): Promise<EditWikiPageResult> {
        const wikiPage = await this.safeWikiClient.getWikiPage(this.subreddit.name, wikiPath.path);
        if (!wikiPage) {
            return "notCreated";
        }

        // Add the editor to the wiki page's list of editors, avoid overwriting the timestamp.
        if (!await this.isWikiPageEditor(wikiPath, editor.id)) {
            await this.redis.zAdd(`wiki:${wikiPath.path}:editors`, {score: Date.now(), member: editor.id});
        }

        // Add the wiki page to the editor's list of editor wiki pages, avoid overwriting the timestamp.
        const editorWikiPages = await this.getEditorWikiPages(editor.id);
        if (!editorWikiPages.includes(wikiPath)) {
            await this.redis.zAdd(`user:${editor.id}:editorWikiPages`, {score: Date.now(), member: wikiPath.path});
        }

        // Add the editor to the wiki page.
        await wikiPage.addEditor(editor.username);

        return "success";
    }

    public async removeWikiPageEditor (wikiPath: WikiPath, editor: User): Promise<EditWikiPageResult> {
        const wikiPage = await this.safeWikiClient.getWikiPage(this.subreddit.name, wikiPath.path);
        if (!wikiPage) {
            return "notCreated";
        }

        // Remove the editor and then the Redis entries.
        await wikiPage.removeEditor(editor.username);
        await this.redis.zRem(`wiki:${wikiPath.path}:editors`, [editor.id]);
        await this.redis.zRem(`user:${editor.id}:editorWikiPages`, [wikiPath.path]);

        return "success";
    }

    /**
     * This function will make the necessary changes to a wiki page to make it a managed wiki page.
     * @param {WikiPage} wikiPage WikiPage object to configure from Devvit
     */
    public async configureWikiPage (wikiPage: WikiPage) {
        await wikiPage.updateSettings({
            listed: this.defaultListed,
            permLevel: WikiPagePermissionLevel.APPROVED_CONTRIBUTORS_ONLY,
        });
    }

    public async isWikiPageEditor (wikiPath: WikiPath, userId: string): Promise<boolean> {
        const allEditors = await this.getWikiPageEditors(wikiPath);
        return allEditors.includes(userId);
    }

    public async isForbidden (user: User): Promise<boolean> {
        const wikiBanned = await isWikiBanned(this.reddit, this.subredditName, user.username);
        const banned = await isBanned(this.reddit, this.subredditName, user.username);
        return wikiBanned || banned;
    }
}

export async function getManagedWikiClient (reddit: RedditAPIClient, redis: RedisClient): Promise<ManagedWikiClient> {
    const subreddit = await reddit.getCurrentSubreddit();
    return new ManagedWikiClient(reddit, redis, subreddit);
}
