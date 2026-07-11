import type {GetSession, Handle} from "@sveltejs/kit";
import {
    apiUrl, constants, loadConfig,
} from "$lib/utils";

interface refreshPayload {
    cookies: string[];
    cookiesString: string;
    accessToken: string;
    refreshToken: string;
}

const ONE_WEEK_COOKIE = "Path=/;SameSite=Lax;Max-Age=604800";

const parseCookieHeader = (currentCookies: string): Map<string, string> => {
    const cookies = new Map<string, string>();
    currentCookies.split("; ").forEach(cookie => {
        const separator = cookie.indexOf("=");
        if (separator === -1) return;
        cookies.set(cookie.slice(0, separator), cookie.slice(separator + 1));
    });
    return cookies;
};

const serializeCookieHeader = (cookies: Map<string, string>): string => Array
    .from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

const buildSetCookie = (name: string, value: string): string => `${name}=${value};${ONE_WEEK_COOKIE}`;

const doAuthRefresh = async (
    refreshUrl: string,
    currentCookies: string,
): Promise<refreshPayload | null> => {
    const cookies = parseCookieHeader(currentCookies);
    // If  refresh it
    // Get the refresh token out of user's cookies
    const refreshToken = cookies.get(constants.refresh_token_cookie_key);
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

            cookies.set(constants.auth_cookie_key, access_token);
            cookies.set(constants.refresh_token_cookie_key, new_refresh_token);

            return {
                cookies: [
                    buildSetCookie(constants.auth_cookie_key, access_token),
                    buildSetCookie(constants.refresh_token_cookie_key, new_refresh_token),
                ],
                cookiesString: serializeCookieHeader(cookies),
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
                const rawToken = currentCookies
                    .split("; ")
                    .find(c => c.split("=")[0] === constants.auth_cookie_key)
                    ?.split("=")[1];

                if (rawToken) {
                    // Get the meat out of the JWT (the middle third, separated
                    // by ".")
                    const token = JSON.parse(Buffer.from(rawToken.split(".")[1], "base64").toString());

                    // Check if JWT has expired
                    const now = new Date();
                    const exp = new Date(token.exp * 1000);
                    const remaining = exp.getTime() - now.getTime();

                    if (remaining > 0) {
                        // Just refresh the session with current data
                        event.locals.user = token;
                        event.locals.token = rawToken;
                    } else {
                        // Access token exists in cookies, see if we can
                        // refresh it.
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
                        }
                    }
                } else {
                    // No access token exists in cookies, see if we can
                    // refresh it anyway.
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
    if (event.locals.user) {
        return {
            config: config.client,
            user: event.locals.user,
            token: event.locals.token,
        };
    }

    return {config: config.client};
};
