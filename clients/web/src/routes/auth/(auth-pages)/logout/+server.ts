import type {RequestHandler} from "@sveltejs/kit";
import {redirect} from "@sveltejs/kit";
import {clearAuthCookies} from "$lib/api/auth-cookies";

export const GET: RequestHandler = event => {
    clearAuthCookies(event);
    throw redirect(302, "/auth/login");
};
