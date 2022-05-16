import config from "$lib/utils/config";
import type {GetSession, Handle} from "@sveltejs/kit";
import {constants} from "$lib/utils";
import type {Session} from "src";

export const handle: Handle = async ({event, resolve}) => {
    if (event.request.headers.has("cookie")) {
        try {
            const cookies = event.request.headers.get("cookie");
            const rawToken = cookies.split("; ").find(c => c.split("=")[0] === constants.auth_cookie_key)
                ?.split("=")[1];
            const token = JSON.parse(atob(rawToken.split(".")[1]));

            const now = new Date();
            const exp = new Date(token.exp * 1000);
            const remaining = exp.getTime() - now.getTime();

            if (remaining < 0) {
                // TODO: Attempt refresh token logic here
                event.request.headers.delete("cookie");
            } else {
                event.locals.user = token;
                event.locals.token = rawToken;
            }
        } catch (e) {
            console.log(e);
        }
    }
    return resolve(event);
};

export const getSession: GetSession = (event): Session => {
    if (event.locals.user) {
        return {
            ...config,
            user: event.locals.user,
            token: event.locals.token,
        } as Session;
    }

    return config;
};
