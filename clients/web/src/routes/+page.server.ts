import {redirect, type ServerLoad} from "@sveltejs/kit";
import {getAuthCookies} from "../lib/api";

export const load: ServerLoad = async event => {
    const auth = getAuthCookies(event);
    if (auth) {
        throw redirect(302, "/app");
    } else {
        throw redirect(302, "/auth/login");
    }
};
