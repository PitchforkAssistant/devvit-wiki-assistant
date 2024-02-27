import {AppInstall} from "@devvit/protos";
import {TriggerContext} from "@devvit/public-api";
import {NAMES} from "../constants/settingNames.js";

export async function onAppInstall (event: AppInstall, context: TriggerContext) {
    const welcomeMessage = await context.settings.get<string>(NAMES.INSTALL_MSG);
    if (!welcomeMessage) {
        console.warn("No welcome message found.");
        return;
    }

    console.log(event);
    console.log(JSON.stringify(event));

    if (event.installer && event.installer.id) {
        // As of writing this, the installer object only seems to populate the ID.
        const installerUsername = (await context.reddit.getUserById(event.installer.id)).username;

        await context.reddit.sendPrivateMessage({
            to: installerUsername,
            subject: "WikiAssistant Installed",
            text: welcomeMessage,
        });
    }

    const subreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.sendPrivateMessage({
        to: `/r/${subreddit.name}`,
        subject: "WikiAssistant Installed",
        text: welcomeMessage,
    });
}
