import { browser } from "$app/environment";
import { RefreshLoginStore } from "$houdini";
import { updateAuthCookies } from "$lib/api";
import { getExpiryFromJwt } from "$lib/utilities/getExpiryFromJwt";
import type { ClientPlugin } from "$houdini";

export const refreshAuthPlugin: ClientPlugin = () => {
    return {
        beforeNetwork: async (ctx, b) => {
            const {next} = b;
            const {session} = ctx;

            // TODO: Actually check the thing
            if (!session?.access) {
                next(ctx);
                return;
            }
            const expAt = getExpiryFromJwt(session?.access);

            // If there is at least one minute on the token; do nothing
            if (expAt.getTime() > new Date().getTime() + 60 * 1000) {
                next(ctx);
                return;
            }
            if (ctx.artifact.name === "RefreshLogin") {
                console.debug(
                    "Avoiding infinite loop. Will not try to refresh auth before a refresh auth call.",
                );
                next(ctx);
                return;
            }

            // Otherwise we need to refresh
            console.log("Attempting to refresh authentication");

            if (session.refresh) {
                const s = new RefreshLoginStore();
                try {
                    const result = await s.mutate(null, {
                        metadata: {
                            accessTokenOverride: session.refresh,
                        },
                        fetch: fetch ?? ctx.fetch,
                    });
                    if (!result.data) {
                        throw new Error(
                            result.errors?.map(e => e.message).join("\n") ?? "Refresh Login Response Empty",
                        );
                    }

                    if (!ctx.session) ctx.session = {};
                    ctx.session.access = result.data.refreshLogin.access;
                    ctx.session.refresh = result.data.refreshLogin.refresh;

                    if (browser) {
                        updateAuthCookies(result.data.refreshLogin);
                    } else {
                        // How do I set cookies here
                        console.warn(
                            "Failed to persist auth cookie updates. Setting cookies in a plugin is not possible?",
                        );
                    }
                    console.debug("Auth has been refreshed");
                } catch (e) {
                    console.warn("Failed to refresh auth token!", e);
                }
            } else {
                console.debug("Skipping Auth Refresh");
            }

            next(ctx);
        },
    };
}