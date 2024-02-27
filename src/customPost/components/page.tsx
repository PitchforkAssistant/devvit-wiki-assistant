import {Pages} from "../pages/pages.js";
import {WikiInterfaceState} from "../state.js";

export interface PageProps {
    state: WikiInterfaceState;
}

export const Page = ({state}: PageProps) => Pages[state.currentPage](state);
