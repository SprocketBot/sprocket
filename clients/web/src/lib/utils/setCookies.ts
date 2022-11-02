import cookies from "js-cookie";

import {constants} from "./constants";

export function setCookies(access: string, refresh: string): void {
    cookies.set(constants.auth_cookie_key, access, {expires: 0.25}); // 6 hours
    cookies.set(constants.refresh_token_cookie_key, refresh, {
        expires: 7, // 7 days
    });
}
