import {setCookie, removeCookie, getCookie} from "typescript-cookie";
import type {RequestEvent} from "@sveltejs/kit";
import {browser} from "$app/environment";

const ACCESS_COOKIE_KEY = "sprocket-access-token";
const REFRESH_COOKIE_KEY = "sprocket-refresh-token";
export const updateAuthCookies = ({access, refresh}: {access: string; refresh: string}, event?: RequestEvent) => {
    // TODO: Should these cookies expire when the tokens themselves do?
    //       That may create a pretty easy mechanism for checking if the tokens themselves have expired.
    if (event) {
        event.cookies.set(ACCESS_COOKIE_KEY, access, {path: "/"});
        event.cookies.set(REFRESH_COOKIE_KEY, refresh, {path: "/"});
    } else {
        if (!browser) {
            console.warn("Failed to set auth cookies; event not provided in a SSR environment");
            return;
        }
        setCookie(ACCESS_COOKIE_KEY, access, {path: "/"});
        setCookie(REFRESH_COOKIE_KEY, refresh, {path: "/"});
    }
};
export const clearAuthCookies = (event?: RequestEvent) => {
    if (event) {
        event.cookies.delete(ACCESS_COOKIE_KEY);
        event.cookies.delete(REFRESH_COOKIE_KEY);
    } else {
        if (!browser) {
            console.warn("Failed to unset auth cookies; event not provided in a SSR environment");
            return;
        }
        removeCookie(ACCESS_COOKIE_KEY, {path: "/"});
        removeCookie(REFRESH_COOKIE_KEY, {path: "/"});
    }
};

export const getAuthCookies = (event?: RequestEvent) => {
    if (event) {
        return {access: event.cookies.get(ACCESS_COOKIE_KEY), refresh: event.cookies.get(REFRESH_COOKIE_KEY)};
    } else {
        if (!browser) {
            console.warn("Failed to get auth cookies; event not provided in a SSR environment");
            return {access: undefined, refresh: undefined};
        }
        return {
            access: getCookie(ACCESS_COOKIE_KEY),
            refresh: getCookie(REFRESH_COOKIE_KEY),
        };
    }
};
