import {WikiInterfaceState} from "../state.js";
import {BannedPage} from "./banned/banned.js";
import {HelpPage} from "./help/helpPage.js";
import {HomePage} from "./home/homePage.js";
import {ModPage} from "./mod/modPage.js";
import {OwnedPage} from "./owned/ownedPage.js";

export type PageName = "home" | "help" | "owned" | "mod" | "banned";

export type PageList = {
    [key in PageName]: (state: WikiInterfaceState) => JSX.Element;
};

export const Pages: PageList = {
    home: HomePage,
    help: HelpPage,
    owned: OwnedPage,
    mod: ModPage,
    banned: BannedPage,
};
