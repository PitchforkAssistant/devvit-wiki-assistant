import {Context, FormKey, UseStateResult, User} from "@devvit/public-api";
import {PageName} from "./pages/pages.js";
import {ADD_EDITOR_FORM, NEW_WIKI_PAGE_FORM, REMOVE_EDITOR_FROM_PAGE, REMOVE_EDITOR_FORM_PAGE_SELECT} from "../constants/formTemplates.js";
import {getManagedWikiClient} from "../wiki/managedWikiClient.js";
import {getWikiPath} from "../wiki/wikiPath.js";

export async function createNewWikiPageSubmit (context: Context, data: Record<string, string>) {
    const wikiPath = getWikiPath(data.wikiPath);
    if (!wikiPath || wikiPath.isDangerous) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Invalid wiki path!",
        });
        return;
    }

    if (!context.userId) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You must be logged in to create a wiki page!",
        });
        return;
    }

    const user = await context.reddit.getUserById(context.userId);
    console.log("got user", user.username);
    const managedWikiPageClient = await getManagedWikiClient(context.reddit, context.redis);
    console.log("got user and managedWikiPageClient");
    const createPageResult = await managedWikiPageClient.createWikiPage(wikiPath, user);
    console.log("createPageResult", createPageResult);

    switch (createPageResult) {
    case "success":
        context.ui.showToast({
            appearance: "success",
            text: "Wiki page created! Attempting to redirect...",
        });
        context.ui.navigateTo(`https://www.reddit.com/r/${managedWikiPageClient.subredditName}/wiki/${wikiPath.path}`);
        break;
    case "alreadyCreated":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: The wiki page at the specified path already exists!",
        });
        break;
    case "alreadyOwned":
        if (wikiPath.isTreeRoot) {
            context.ui.showToast({
                appearance: "neutral",
                text: "ERROR: The wiki page at the specified path is already owned by someone else!",
            });
        } else {
            context.ui.showToast({
                appearance: "neutral",
                text: "ERROR: The wiki page at the specified path or its top level page is already owned by someone else!",
            });
        }
        break;
    case "errorRedis":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Error registering wiki page!",
        });
        break;
    case "errorWiki":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Error creating wiki page!",
        });
        break;
    }
}

export async function addEditorFormSubmit (context: Context, data: Record<string, string | string[]>) {
    if (!context.userId) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You must be logged in to add an editor!",
        });
        return;
    }

    if (!data.wikiPath || !data.wikiPath.length) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You must select a wiki page to add an editor!",
        });
        return;
    }

    if (Array.isArray(data.wikiPath) && data.wikiPath.length > 0) {
        data.wikiPath = data.wikiPath[0];
    }

    const wikiPath = getWikiPath(String(data.wikiPath));
    if (!wikiPath || wikiPath.isDangerous) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Invalid wiki path!",
        });
        return;
    }

    if (!data.editor || data.editor.length < 3) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You must enter a username to add an editor!",
        });
        return;
    }

    let newEditor: User | undefined;
    try {
        newEditor = await context.reddit.getUserByUsername(String(data.editor));
    } catch (e) {
        if (!String(e).includes("404")) {
            console.error("Non-404 error getting user: ", e);
        }
    }
    if (!newEditor) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: The specified user does not exist!",
        });
        return;
    }

    const managedWikiClient = await getManagedWikiClient(context.reddit, context.redis);
    const addEditorResult = await managedWikiClient.addWikiPageEditor(wikiPath, newEditor);
    switch (addEditorResult) {
    case "success":
        context.ui.showToast({
            appearance: "success",
            text: `${newEditor.username} is now an editor of ${wikiPath.path}!`,
        });
        break;
    case "notCreated":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: The specified wiki page does not exist!",
        });
        break;
    case "error":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Error adding editor!",
        });
        break;
    }
}

export async function removeEditorFormSubmit (context: Context, data: Record<string, string | string[]>) {
    if (!context.userId) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You must be logged in to remove an editor!",
        });
        return;
    }

    if (!data.wikiPath || typeof data.wikiPath !== "string" || !data.wikiPath.length) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You did not select a wiki page!",
        });
        return;
    }

    if (!data.editor || !Array.isArray(data.editor) || data.editor.length === 0) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: You did not select an editor!",
        });
        return;
    }

    const wikiPath = getWikiPath(data.wikiPath);
    if (!wikiPath || wikiPath.isDangerous) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Invalid wiki path!",
        });
        return;
    }

    const editorUser = await context.reddit.getUserByUsername(data.editor[0]);
    if (!editorUser) {
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: The specified user does not exist!",
        });
        return;
    }

    const managedWikiClient = await getManagedWikiClient(context.reddit, context.redis);
    const removeEditorResult = await managedWikiClient.removeWikiPageEditor(wikiPath, editorUser);

    switch (removeEditorResult) {
    case "success":
        context.ui.showToast({
            appearance: "success",
            text: `${editorUser.username} is no longer an editor of ${wikiPath.path}!`,
        });
        break;
    case "notCreated":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: The specified wiki page does not exist!",
        });
        break;
    case "error":
        context.ui.showToast({
            appearance: "neutral",
            text: "ERROR: Error removing editor!",
        });
        break;
    }
}

export class WikiInterfaceState {
    readonly _currentPage: UseStateResult<PageName>;
    readonly _createPageForm: FormKey;
    readonly _addEditorForm: FormKey;
    readonly _removeEditorPageSelect: FormKey;
    readonly _removeEditorForm: FormKey;
    readonly _ownedPages: UseStateResult<string[]>;
    readonly _subName: UseStateResult<string>;
    readonly _isForbidden: UseStateResult<boolean>;

    constructor (public context: Context, startPage: PageName = "home") {
        this.context = context;
        this._currentPage = context.useState<PageName>(startPage);
        this._createPageForm = context.useForm(NEW_WIKI_PAGE_FORM, async data => {
            await createNewWikiPageSubmit(context, data);
        });
        this._ownedPages = context.useState<string[]>(async () => {
            if (!context.userId) {
                return [];
            }
            const managedWikiClient = await getManagedWikiClient(context.reddit, context.redis);
            const ownedWikiPaths = await managedWikiClient.getOwnedWikiPages(context.userId);
            return ownedWikiPaths.map(wikiPath => wikiPath.path);
        });
        this._subName = context.useState<string>(async () => {
            const subreddit = await context.reddit.getSubredditById(context.subredditId);
            return subreddit.name;
        });
        this._isForbidden = context.useState<boolean>(async () => {
            if (!context.userId) {
                return true;
            }
            const managedWikiClient = await getManagedWikiClient(context.reddit, context.redis);
            const forbidden = await managedWikiClient.isForbidden(await context.reddit.getUserById(context.userId));
            if (forbidden) {
                this.currentPage = "banned";
            }
            return forbidden;
        });
        this._addEditorForm = context.useForm(ADD_EDITOR_FORM, async data => {
            await addEditorFormSubmit(context, data);
        });
        this._removeEditorForm = context.useForm(REMOVE_EDITOR_FROM_PAGE, async data => {
            await removeEditorFormSubmit(context, data);
        });
        this._removeEditorPageSelect = context.useForm(REMOVE_EDITOR_FORM_PAGE_SELECT, async data => {
            if (!this.context.userId) {
                context.ui.showToast({
                    appearance: "neutral",
                    text: "ERROR: You must be logged in to remove an editor!",
                });
                return;
            }
            let wikiPathString = "";
            if (Array.isArray(data.wikiPath) && data.wikiPath.length > 0) {
                wikiPathString = String(data.wikiPath[0]);
            } else {
                context.ui.showToast({
                    appearance: "neutral",
                    text: "ERROR: You must select a wiki path!",
                });
                return;
            }
            const wikiPath = getWikiPath(wikiPathString);
            if (!wikiPath || wikiPath.isDangerous) {
                context.ui.showToast({
                    appearance: "neutral",
                    text: "ERROR: Invalid wiki path!",
                });
                return;
            }
            const managedWikiClient = await getManagedWikiClient(context.reddit, context.redis);
            const editorIds = await managedWikiClient.getWikiPageEditors(wikiPath);
            const editorUsernames = await Promise.all(editorIds.map(async userId => {
                const user = await context.reddit.getUserById(userId);
                return user.username;
            }));
            if (!editorUsernames || editorUsernames.length === 0) {
                context.ui.showToast({
                    appearance: "neutral",
                    text: "ERROR: No editors to remove!",
                });
                return;
            }
            context.ui.showForm(this.removeEditorForm, {wikiPath: wikiPath.path, editors: editorUsernames});
        });
    }

    get subredditName (): string {
        return this._subName[0];
    }

    get isForbidden (): boolean {
        return this._isForbidden[0];
    }

    get currentPage (): PageName {
        return this._currentPage[0];
    }

    set currentPage (page: PageName) {
        this._currentPage[1](page);
    }

    get ownedPages (): string[] {
        return this._ownedPages[0];
    }

    get createPageForm (): FormKey {
        return this._createPageForm;
    }

    get addEditorForm (): FormKey {
        return this._addEditorForm;
    }

    get removeEditorPageSelect (): FormKey {
        return this._removeEditorPageSelect;
    }

    get removeEditorForm (): FormKey {
        return this._removeEditorForm;
    }

    get pageTitle (): string {
        switch (this.currentPage) {
        case "home":
            return "";
        case "help":
            return "Help";
        case "mod":
            return "Moderator Help";
        case "owned":
            return "Owned Wiki Pages";
        default:
            return "";
        }
    }
}
