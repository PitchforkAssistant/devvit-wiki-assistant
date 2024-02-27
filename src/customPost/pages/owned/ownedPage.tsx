import {Devvit} from "@devvit/public-api";
import {WikiInterfaceState} from "../../state.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const OwnedPage = (state: WikiInterfaceState) => {
    const createWikiPagePressed = () => {
        state.context.ui.showForm(state.createPageForm);
    };

    const addWikiPageEditorsPressed = () => {
        state.context.ui.showForm(state.addEditorForm, {wikiPaths: state.ownedPages});
    };

    const removeWikiPageEditorsPressed = () => {
        state.context.ui.showForm(state.removeEditorPageSelect, {wikiPaths: state.ownedPages});
    };

    return (<vstack alignment="center middle" gap="medium" grow>
        <button onPress={createWikiPagePressed}>Create a Wiki Page</button>
        <button onPress={addWikiPageEditorsPressed}>Add Editor to Wiki Page</button>
        <button onPress={removeWikiPageEditorsPressed}>Remove Editor from Wiki Page</button>
    </vstack>);
};

