import type {GetSession, Handle} from "@sveltejs/kit";

import {constants, loadConfig} from "$lib/utils";

export const handle: Handle = async ({event, resolve}) => {
    let newCookiesString = "";
    if (event.request.headers.has("cookie")) {
        try {
            const config = await loadConfig();
            const currentCookies = event.request.headers.get("cookie");
            if (currentCookies) {
                const rawToken = currentCookies.split("; ").find(c => c.split("=")[0] === constants.auth_cookie_key)
                    ?.split("=")[1];
                if (rawToken) {
                    // Get the meat out of the JWT (the middle third, separated
                    // by ".")
                    const token = JSON.parse(atob(rawToken.split(".")[1]));

                    // Check if JWT has expired
                    const now = new Date();
                    const exp = new Date(token.exp * 1000);
                    const remaining = exp.getTime() - now.getTime();

                    if (remaining < 0) {
                        // If so, refresh it
                        // Get the refresh token out of user's cookies
                        const refreshToken = currentCookies.split("; ").find(c => c.split("=")[0] === constants.refresh_token_cookie_key)
                            ?.split("=")[1];
                        if (refreshToken) {
                            // Send that refresh token to the backend, asking
                            // for a new JWT
                            const res = await fetch(`http://${config.client.gqlUrl}/refresh`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${refreshToken}`,
                                },
                            });

                            // Pull the new tokens out of the response
                            const tokens = await res.json();
                            const access_token = tokens.access_token;
                            const new_refresh_token = tokens.refresh_token;

                            // Store these new tokens back in the user's cookies
                            const newCookies = currentCookies.split("; ");

                            // Access token cookie
                            const newCookies1 = newCookies.map(c => {
                                if (c.split("=")[0] === constants.auth_cookie_key) {
                                    const timeNow = new Date();
                                    const time = now.getTime();
                                    const oneWeek = 1000 * 60 * 30;
                                    const expiry = time + oneWeek;
                                    timeNow.setTime(expiry);
                                    return `${constants.auth_cookie_key}=${access_token};expires=${timeNow.toUTCString()}`;
                                }
                                return c;
                            });
                            // Refresh token cookie
                            const newCookies2 = newCookies1.map(c => {
                                if (c.split("=")[0] === constants.refresh_token_cookie_key) {
                                    const timeNow = new Date();
                                    const time = now.getTime();
                                    const oneWeek = 1000 * 60 * 60 * 24 * 7;
                                    const expiry = time + oneWeek;
                                    timeNow.setTime(expiry);
                                    return `${constants.refresh_token_cookie_key}=${new_refresh_token};expires=${timeNow.toUTCString()}`;
                                }
                                return c;
                            });

                            // Roll our cookies back up into one string
                            newCookiesString = newCookies2.join("; ");
                            event.request.headers.set("cookie", newCookiesString);

                            // Refresh the session as well
                            event.locals.user = JSON.parse(atob(access_token.split(".")[1]));
                            event.locals.token = access_token;
                        }
                    } else {

                        // Just refresh the session with current data
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
    result.headers.set("Set-Cookie", newCookiesString);
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
