import {WikiPage} from "@devvit/public-api";

export type WikiPageState = "exists" | "blank" | "missing";

export type CreateWikiPageResult = "success" | "alreadyOwned" | "alreadyCreated" | "errorRedis" | "errorWiki";
export type DeleteWikiPageResult = "success" | "notOwned" | "notCreated" | "errorRedis" | "errorWiki";
export type EditWikiPageResult = "success" | "notCreated" | "error";

export type PartialExcept<T, K extends keyof T> = Partial<Pick<T, Exclude<keyof T, K>>> & Required<Pick<T, K>>;

export type GetWikiPageResult = {
    state: "exists";
    wikiPage: WikiPage;
} | {
    state: "blank";
    wikiPage: Pick<WikiPage, "name" & "subredditName" & "update" & "getSettings" & "updateSettings" & "addEditor" & "removeEditor">;
} | {
    state: "missing";
    wikiPage: Pick<WikiPage, "name" & "subredditName" & "update">
};
