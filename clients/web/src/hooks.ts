import type {GetSession, Handle} from "@sveltejs/kit";
import {constants, loadConfig} from "$lib/utils";

export const handle: Handle = async ({event, resolve}) => {
    if (event.request.headers.has("cookie")) {
        try {
            const cookies = event.request.headers.get("cookie");
            if (cookies) {
                const rawToken = cookies.split("; ").find(c => c.split("=")[0] === constants.auth_cookie_key)
                    ?.split("=")[1];
                if (rawToken) {
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
            }
        } catch (e) {
            console.error(e);
        }
    }
    const result = await resolve(event);
    return result;
};

export const getSession: GetSession = async event => {
    const config = await loadConfig();

    // Anything put on the session here is available in the client
    // Make sure it is safe and secure to do so!
    if (event.locals.user) {
        return {
            config: config.client,
            user: event.locals.user,
            token: event.locals.token,
        };
    }

    return {config: config.client};
};
