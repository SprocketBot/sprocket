import type {Handle} from "@sveltejs/kit";
import {RefreshLoginStore} from "../../$houdini";

export const AuthRefreshHook: Handle = async ({event, resolve}) => {
    console.debug("Refreshing Authentication");
    // Get session information
    const refresh = event.cookies.get("sprocket-refresh-token");

    // Just do a refresh on each page load; because these are not super common
    if (refresh) {
        const s = new RefreshLoginStore();

        try {
            const result = await s.mutate(null, {});
            if (!result.data) {
                throw new Error(result.errors?.map(e => e.message).join("\n") ?? "Refresh Login Response Empty");
            }
            event.cookies.set("sprocket-access-token", result.data.refreshLogin.access, {path: "/"});
            event.cookies.set("sprocket-refresh-token", result.data.refreshLogin.refresh, {path: "/"});
            console.debug("Auth has been refreshed");
        } catch (e) {
            console.warn("Failed to refresh auth token!", e);
        }
    } else {
        console.debug("Skipping Auth Refresh");
    }

    // pass the event onto the default handle

    return await resolve(event);
};
