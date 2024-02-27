import {CustomPostType, Devvit} from "@devvit/public-api";
import {WikiInterfaceState} from "./state.js";

import {Page} from "./components/page.js";

export const WikiInterfacePost: CustomPostType = {
    name: "WikiAssistant Interface",
    render: context => {
        const state = new WikiInterfaceState(context);
        return (
            <blocks>
                <vstack alignment="center top" width="100%" height="100%">
                    <hstack alignment="center middle" minWidth="100%" padding="small" border="thick">
                        <button icon="home" appearance="plain" disabled={state.currentPage === "home" || state.currentPage === "banned"} onPress={() => {
                            state.currentPage = "home";
                        }}>Home</button>
                        <vstack alignment="center middle" grow>
                            <text style="heading">WikiAssistant Interface</text>
                            <text style="metadata" height={state.currentPage === "home" ? "0%" : undefined}>{state.pageTitle}</text>
                        </vstack>
                        <button icon="help" appearance="plain" disabled={state.currentPage === "help" || state.currentPage === "banned"} onPress={() => {
                            state.currentPage = "help";
                        }}>Help</button>
                    </hstack>
                    <vstack alignment="center middle" grow width="100%">
                        <Page state={state} />
                    </vstack>
                </vstack>
            </blocks>
        );
    },
};
