import {load_OpenScrims} from "$houdini";
import type {LayoutLoad} from "./$types";

export const load: LayoutLoad = async e => {
    return {openScrims: (await load_OpenScrims({event: e}).catch()).OpenScrims};
};
