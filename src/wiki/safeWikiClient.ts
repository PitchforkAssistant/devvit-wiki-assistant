import {CreateWikiPageOptions, RedditAPIClient, WikiPage} from "@devvit/public-api";

export class SafeWikiClient {
    constructor (protected reddit: RedditAPIClient) {}

    /**
     * This function safely gets the status of a wiki page. Devvit throws an error if a wiki page doesn't exist or if it doesn't have a revision history.
     * The function will return undefined if the wiki page doesn't exist.
     * If the wiki page exists, but doesn't have a revision history, the function will make the first edit to the wiki page before returning it.
     * @param subredditName Subreddit of the wiki page.
     * @param wikiPath Path of the wiki page.
     * @returns {WikiPage | undefined} The wiki page if it exists, or undefined if it doesn't.
     */
    public async getWikiPage (subredditName: string, wikiPath: string): Promise<WikiPage | undefined> {
        try {
            const wikiPage = await this.reddit.getWikiPage(subredditName, wikiPath);
            return wikiPage;
        } catch (error) {
            // Try to the error, we don't need more than the error message.
            let errorMessage: string;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }

            if (errorMessage.includes("PAGE_NOT_CREATED") || errorMessage.includes("404 Not Found")) {
                // If the wiki page doesn't exist, return undefined.
                return;
            } else if (errorMessage.includes("Wiki page author details are missing")) {
                // This error occurs when the wiki page exists, but doesn't have a revision history.
                // We can fix this by making the first edit to the wiki page.
                await this.reddit.updateWikiPage({
                    subredditName,
                    page: wikiPath,
                    content: "---", // Markdown renders this as a horizontal line, AutoModerator uses this to separate sections. It's a safe default for both.
                    reason: "Devvit blank page fix",
                });
                return this.getWikiPage(subredditName, wikiPath);
            } else {
                console.error("Unexpected error while getting wiki page!");
                throw error;
            }
        }
    }

    public async createWikiPage (options: CreateWikiPageOptions): Promise<WikiPage | undefined> {
        try {
            if (options.content === "") {
                // If the content is empty, we'll set it to "---" to avoid creating a problematic blank page.
                options.content = "---";
            }
            const createdPage = await this.reddit.createWikiPage(options);
            return createdPage;
        } catch (error) {
            console.warn("Error creating wiki page", error);
            return;
        }
    }
}
