import type {GetSession, Handle} from "@sveltejs/kit";
import {apiUrl, constants, loadConfig} from "$lib/utils";
import {add} from "date-fns";

interface refreshPayload {
    cookies: string[];
    cookiesString: string;
    accessToken: string;
    refreshToken: string;
}

const doAuthRefresh = async (
    refreshUrl: string,
    currentCookies: string,
): Promise<refreshPayload | null> => {
    let newCookiesString = "";
    // Get the refresh token out of user's cookies
    // Handle various cookie header formats robustly
    const cookiePairs = currentCookies.split("; ").map(c => c.trim()).filter(Boolean);
    const refreshToken = cookiePairs
        .find(c => c.split("=")[0] === constants.refresh_token_cookie_key)
        ?.split("=")[1];
    if (refreshToken) {
    // Send that refresh token to the backend, asking
    // for a new JWT
        const res = await fetch(refreshUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`Auth refresh failed for ${refreshUrl}: ${res.status} ${res.statusText} - ${text}`);
            return null;
        }

        try {
        // Pull the new tokens out of the response
            const tokens = await res.json();
            const access_token = tokens.access_token;
            const new_refresh_token = tokens.refresh_token;

            // Store these new tokens back in the user's cookies
            const newCookies = currentCookies.split("; ");

            // Access token cookie
            let newCookies1: string[];
            if (newCookies.some(c => c.split("=")[0] === constants.auth_cookie_key)) {
                // Cookie still exists, just update it
                newCookies1 = newCookies.map(c => {
                    if (c.split("=")[0] === constants.auth_cookie_key) {
                        return `${constants.auth_cookie_key}=${access_token};expires=${add(new Date(), {
                            weeks: 1,
                        }).toUTCString()}`;
                    }
                    return c;
                });
            } else {
                // Access token cookie doesn't exist, add it.
                newCookies1 = newCookies;
                newCookies1.push(`${constants.auth_cookie_key}=${access_token};expires=${add(new Date(), {
                    weeks: 1,
                }).toUTCString()}`);
            }

            // Refresh token cookie
            const newCookies2 = newCookies1.map(c => {
                if (c.split("=")[0] === constants.refresh_token_cookie_key) {
                    return `${constants.refresh_token_cookie_key}=${new_refresh_token};expires=${add(
                        new Date(),
                        {weeks: 1},
                    ).toUTCString()}`;
                }
                return c;
            });

            // Roll our cookies back up into one string
            newCookiesString = newCookies2.join("; ");

            return {
                cookies: newCookies2,
                cookiesString: newCookiesString,
                accessToken: access_token,
                refreshToken: new_refresh_token,
            };
        } catch (e) {
            console.error("Failed to parse refresh token response:", e);
            return null;
        }
    }

    return null;
};

export const handle: Handle = async ({event, resolve}) => {
    let newCookies: string[] = [];

    if (event.request.headers.has("cookie")) {
        try {
            const config = await loadConfig();
            const currentCookies = event.request.headers.get("cookie");

            if (currentCookies) {
                const cookiePairs = currentCookies.split("; ").map(c => c.trim()).filter(Boolean);
                const rawToken = cookiePairs
                    .find(c => c.split("=")[0] === constants.auth_cookie_key)
                    ?.split("=")[1];

                if (rawToken) {
                    // Get the meat out of the JWT (the middle third, separated
                    // by ".")
                    const token = JSON.parse(Buffer.from(rawToken.split(".")[1], "base64").toString());

                    // Check if JWT has expiration claim
                    const now = new Date();
                    if (!token.exp) {
                        // No expiration claim - treat as valid but log warning
                        console.warn("JWT has no exp claim - treating as valid");
                        event.locals.user = token;
                        event.locals.token = rawToken;
                    } else {
                        const exp = new Date(token.exp * 1000);
                        const remaining = exp.getTime() - now.getTime();

                        if (remaining > 0) {
                            // Token is valid, use it
                            event.locals.user = token;
                            event.locals.token = rawToken;
                        } else {
                            // Access token has expired, attempt to refresh
                            console.log("Access token expired, attempting refresh...");
                            const result = await doAuthRefresh(
                                apiUrl(config.client, "/refresh"),
                                currentCookies,
                            );
                            if (result) {
                                event.request.headers.set("cookie", result.cookiesString);
                                newCookies = result.cookies;
                                // Refresh the session as well
                                event.locals.user = JSON.parse(Buffer.from(result.accessToken.split(".")[1], "base64").toString());
                                event.locals.token = result.accessToken;
                                console.log("Token refresh successful");
                            } else {
                                // Refresh failed - clear the stale session
                                // The old token is no longer valid, don't trust it
                                console.log("Token refresh failed - clearing session");
                                event.locals.user = undefined;
                                event.locals.token = undefined;
                            }
                        }
                    }
                } else {
                    // No access token exists in cookies, see if we can
                    // refresh it anyway (user might have refresh token without access token)
                    console.log("No access token, attempting refresh with refresh token...");
                    const result = await doAuthRefresh(
                        apiUrl(config.client, "/refresh"),
                        currentCookies,
                    );
                    if (result) {
                        event.request.headers.set("cookie", result.cookiesString);
                        newCookies = result.cookies;
                        // Refresh the session as well
                        event.locals.user = JSON.parse(Buffer.from(result.accessToken.split(".")[1], "base64").toString());
                        event.locals.token = result.accessToken;
                        console.log("Token refresh successful (no access token case)");
                    } else {
                        // Refresh failed - no valid tokens, clear any residual session
                        console.log("Token refresh failed - clearing session (no access token case)");
                        event.locals.user = undefined;
                        event.locals.token = undefined;
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    const result = await resolve(event);
    for (const cookie of newCookies) {
        result.headers.append("Set-Cookie", cookie);
    }
    return result;
};

export const getSession: GetSession = async event => {
    const config = await loadConfig();

    // Anything put on the session here is available in the client
    // Make sure it is safe and secure to do so!
    // Only return user data if it exists AND is valid (has userId)
    if (event.locals.user && event.locals.user.userId) {
        return {
            config: config.client,
            user: event.locals.user,
            token: event.locals.token,
        };
    }

    // No valid user - return just the config, not user data
    // This ensures unauthenticated users get a clean session
    console.log("getSession: No valid user in session, returning empty session");
    return {config: config.client};
};
