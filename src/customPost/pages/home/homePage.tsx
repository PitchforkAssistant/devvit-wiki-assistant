import {Devvit} from "@devvit/public-api";
import {WikiInterfaceState} from "../../state.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HomePage = (state: WikiInterfaceState) => {
    function managePage () {
        state.currentPage = "owned";
    }

    return (
        <vstack alignment="center middle" gap="medium" grow>
            <button onPress={managePage}>Owned Wiki Pages</button>
            <button disabled>Editored Wiki Pages</button>
            <button onPress={() => {
                state.context.ui.navigateTo(`https://www.reddit.com/r/${state.subredditName}/wiki/pages/`);
            }}>Show All Wiki Pages</button>
        </vstack>
    );
};

