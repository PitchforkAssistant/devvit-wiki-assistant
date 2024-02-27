import {Devvit} from "@devvit/public-api";
import {WikiInterfaceState} from "../../state.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BannedPage = (state: WikiInterfaceState) => (
    <vstack alignment="center middle" gap="medium" grow>
        <text style="heading">
            You are forbidden from using this service.
        </text>
        <text style="body">
            For more information, please message the subreddit moderators.
        </text>
        <button onPress={() => {
            state.context.ui.navigateTo(`https://www.reddit.com/message/compose/?to=/r/${state.subredditName}`);
        }}>Message the Moderators</button>
    </vstack>
);
