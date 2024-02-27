import {Devvit} from "@devvit/public-api";

import {onAppInstall} from "./triggers/onAppInstall.js";
import {onCreatePostButton, onCreatePostSubmit} from "./triggers/createPost.js";

import {NAMES} from "./constants/settingNames.js";
import {DEFAULTS} from "./constants/defaultValues.js";
import {NEW_POST_FORM} from "./constants/formTemplates.js";
import {WikiInterfacePost} from "./customPost/index.js";

// Enable any Devvit features you might need.
Devvit.configure({
    redditAPI: true,
    redis: true,
    media: false,
    http: false,
});

Devvit.addSettings([
    {
        name: NAMES.INSTALL_MSG,
        label: "Install Message",
        type: "string",
        scope: "app",
        defaultValue: DEFAULTS.INSTALL_MSG,
    },
]);

Devvit.addTrigger({
    event: "AppInstall",
    onEvent: onAppInstall,
});

Devvit.addMenuItem({
    location: "subreddit",
    forUserType: "moderator",
    label: "Post WikiAssistant Interface",
    onPress: onCreatePostButton,
});

export const onCreatePostForm = Devvit.createForm(NEW_POST_FORM, onCreatePostSubmit);

Devvit.addCustomPostType(WikiInterfacePost);

export default Devvit;
