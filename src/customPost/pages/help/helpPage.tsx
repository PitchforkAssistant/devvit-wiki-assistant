import {Devvit} from "@devvit/public-api";
import {WikiInterfaceState} from "../../state.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HelpPage = (state: WikiInterfaceState) => (
    <vstack alignment="top center" gap="small" padding="small" grow>
        <vstack alignment="center middle" gap="none">
            <text style="heading" wrap alignment="center">What is this?</text>
            <text style="body" wrap alignment="center">
                This is a tool to create and manage your very own personal pages on the subreddit wiki.
            </text>
        </vstack>
        <vstack alignment="center middle" gap="none">
            <text style="heading" wrap alignment="center">Why is this?</text>
            <text style="body" wrap alignment="center">
            Have you ever wanted a personal page on the subreddit wiki? Now you can have one! You can use it to store information, write guides, or anything else! It's your page, so you can do whatever you want with it. You can also add editors to collaborate with you on your page.
            </text>
        </vstack>
        <vstack alignment="center middle" gap="none">
            <text style="heading" wrap alignment="center">How do I use it?</text>
            <text style="body" wrap alignment="center">
            You'll want to go back to the home page and click on the "Owned Wiki Pages" button. From there, you can create new pages and add or remove editors from your pages.
            </text>
        </vstack>
    </vstack>
);

