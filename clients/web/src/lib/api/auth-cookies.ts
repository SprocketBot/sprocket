import {setCookie, removeCookie, getCookie} from "typescript-cookie";
import type {RequestEvent} from "@sveltejs/kit";

const ACCESS_COOKIE_KEY = "sprocket-access-token";
const REFRESH_COOKIE_KEY = "sprocket-refresh-token";
export const updateAuthCookies = ({access, refresh}: {access: string; refresh: string}, event?: RequestEvent) => {
    // TODO: Should these cookies expire when the tokens themselves do?
    //       That may create a pretty easy mechanism for checking if the tokens themselves have expired.

    if (event) {
        event.cookies.set(ACCESS_COOKIE_KEY, access, {path: "/"});
        event.cookies.set(REFRESH_COOKIE_KEY, refresh, {path: "/"});
    } else {
        setCookie(ACCESS_COOKIE_KEY, access, {path: "/"});
        setCookie(REFRESH_COOKIE_KEY, refresh, {path: "/"});
    }
};
export const clearAuthCookies = (event?: RequestEvent) => {
    if (event) {
        event.cookies.delete(ACCESS_COOKIE_KEY);
        event.cookies.delete(REFRESH_COOKIE_KEY);
    } else {
        removeCookie(ACCESS_COOKIE_KEY, {path: "/"});
        removeCookie(REFRESH_COOKIE_KEY, {path: "/"});
    }
};

export const getAuthCookies = (event?: RequestEvent) => {
    return {
        access: event ? event.cookies.get(ACCESS_COOKIE_KEY) : getCookie(ACCESS_COOKIE_KEY),
        refresh: event ? event.cookies.get(REFRESH_COOKIE_KEY) : getCookie(REFRESH_COOKIE_KEY),
    };
};
