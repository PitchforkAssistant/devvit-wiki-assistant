import {Context, FormOnSubmitEvent, MenuItemOnPressEvent} from "@devvit/public-api";
import {WikiPostPreview} from "../customPost/components/preview.js";
import {onCreatePostForm} from "../main.js";

export async function onCreatePostButton (event: MenuItemOnPressEvent, context: Context) {
    context.ui.showForm(onCreatePostForm);
}

export async function onCreatePostSubmit (event: FormOnSubmitEvent, context: Context) {
    const title = event.values.title as string;
    const subreddit = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
        title,
        subredditName: subreddit.name,
        preview: WikiPostPreview,
    });
    context.ui.showToast("Posted new WikiAssistant Interface, attempting to navigate to post...");
    context.ui.navigateTo(post);
}
