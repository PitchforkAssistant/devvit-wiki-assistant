
import {Data, Form, FormFunction} from "@devvit/public-api";

export const NEW_POST_FORM: Form = {
    title: "Post WikiAssistant Interface",
    fields: [
        {
            name: "title",
            type: "string",
            label: "Post Title",
            placeholder: "Enter a title for the post",
            required: true,
        },
    ],
    acceptLabel: "Post",
    cancelLabel: "Cancel",
};

export const NEW_WIKI_PAGE_FORM: Form = {
    title: "Create New Wiki Page",
    description: "Create a new wiki page at the specified path.",
    fields: [
        {
            label: "What's a Wiki Page Path?",
            type: "group",
            fields: [

                {
                    name: "tutorial",
                    type: "paragraph",
                    label: "",
                    defaultValue: "The path should be unique and not already exist. If the path already exists, the page will not be created.\n\nThe simplest path is just any string that begins with a letters and consists of just lowercase letters, an underscore, dash, and number.\n\nYou can also use slashes to create a hierarchy of pages. For example, 'my_page' and 'my_page/child_page' are both valid paths.",
                    disabled: true,
                    lineHeight: 10,
                },
            ],
        },
        {
            name: "wikiPath",
            type: "string",
            label: "Wiki Page Path",
            placeholder: "Enter the path for the new wiki page",
            helpText: "Examples:\n my_page\n my_page/child_page\n my_page/child_page/grandchild_page",
            required: true,
        },
    ],
    acceptLabel: "Create Wiki Page",
    cancelLabel: "Cancel",
};

export const ADD_EDITOR_FORM: FormFunction = (data: Data) => {
    if (!data.wikiPaths || !Array.isArray(data.wikiPaths)) {
        data.wikiPaths = [];
    }
    const wikiPathOptions = [];
    for (const wikiPath of data.wikiPaths) {
        wikiPathOptions.push({value: String(wikiPath), label: String(wikiPath)});
    }
    return {
        title: "Add Editor to Wiki Page",
        fields: [
            {
                name: "wikiPath",
                type: "select",
                label: "Wiki Page Path",
                options: wikiPathOptions,
                required: true,
            },
            {
                name: "editor",
                type: "string",
                label: "Editor",
                placeholder: "Enter the username of the editor",
                required: true,
            },
        ],
        acceptLabel: "Add Editor",
        cancelLabel: "Cancel",
    };
};

export const REMOVE_EDITOR_FORM_PAGE_SELECT: FormFunction = (data: Data) => {
    if (!data.wikiPaths || !Array.isArray(data.wikiPaths)) {
        data.wikiPaths = [];
    }
    const wikiPathOptions = [];
    for (const wikiPath of data.wikiPaths) {
        wikiPathOptions.push({value: String(wikiPath), label: String(wikiPath)});
    }
    return {
        title: "Remove Editor from Wiki Page",
        fields: [
            {
                name: "wikiPath",
                type: "select",
                label: "Which wiki page do you want to remove an editor from?",
                options: wikiPathOptions,
                defaultValue: [wikiPathOptions[0].value, wikiPathOptions[0].value],
                required: true,
                multiSelect: false,
            },
        ],
        acceptLabel: "Continue",
        cancelLabel: "Cancel",
    };
};

export const REMOVE_EDITOR_FROM_PAGE: FormFunction = (data: Data) => {
    if (!data.wikiPath) {
        data.wikiPath = "";
    }
    if (!data.editors || !Array.isArray(data.editors)) {
        data.editors = [];
    }
    const editorOptions = [];
    for (const editor of data.editors) {
        editorOptions.push({value: String(editor), label: String(editor)});
    }
    return {
        title: "Remove Editor from Wiki Page",
        fields: [
            {
                name: "wikiPath",
                type: "string",
                label: "Selected Wiki Page",
                defaultValue: String(data.wikiPath),
                required: true,
                disabled: true,
            },
            {
                name: "editor",
                type: "select",
                label: "Which editor do you want to remove?",
                options: editorOptions,
                defaultValue: [editorOptions[0].value],
                required: true,
                multiSelect: false,
            },
        ],
        acceptLabel: "Remove Editor",
        cancelLabel: "Cancel",
    };
};
