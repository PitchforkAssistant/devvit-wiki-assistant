import {FormOnSubmitEvent, Context} from "@devvit/public-api";

export async function newWikiFormSubmitted (event: FormOnSubmitEvent, context: Context) {
    let wikiPage;
    try {
        wikiPage = await context.reddit.getWikiPage((await context.reddit.getCurrentSubreddit()).name, event.values.wikiPath as string);
    } catch (error) {
        console.log("Error getting wiki page:", error);
        console.log(typeof error);
        console.log(error instanceof Error);
        if (error instanceof Error) {
            console.log(Object.keys(error));
            console.log(JSON.stringify(error));
            console.log(`message (type ${typeof error.message}): ${error.message}`);
            console.log(`name (type ${typeof error.name}): ${error.name}`);
            console.log(`stack (type ${typeof error.stack}): ${error.stack}`);
        }
        throw error;
    }
    console.log(wikiPage);
    console.log(JSON.stringify(wikiPage));
    console.log(Object.keys(wikiPage));
}
