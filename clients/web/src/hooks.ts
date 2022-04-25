import type {IConfig} from "$lib/utils/config";
import config from "$lib/utils/config";
import type {GetSession, Handle} from "@sveltejs/kit";
import {constants} from "$lib/utils";

// eslint-disable-next-line func-style
export const handle: Handle = async function({event, resolve}) {
    if (event.request.headers.has("cookie")) {
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
    }
    return resolve(event);
};

// eslint-disable-next-line func-style
export const getSession: GetSession = function(event): IConfig {
    if (event.locals.user) {
        return {
            ...config,
            user: event.locals.user,
            token: event.locals.token,
        };
    }

    return config;
};
