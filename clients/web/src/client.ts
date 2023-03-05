import {env} from "$env/dynamic/public";
import {HoudiniClient, RefreshLoginStore} from "$houdini";
import {createClient} from "graphql-ws";
import {subscription} from "$houdini/plugins";
import {goto} from "$app/navigation";
import {browser} from "$app/environment";
import {updateAuthCookies} from "$lib/api/auth-cookies";
import {getExpiryFromJwt} from "./lib/utilities/getExpiryFromJwt";
import {clearAuthCookies} from "./lib/api/auth-cookies";

const getAuthToken = ({
    session,
    metadata,
    useRefresh,
}: {session?: App.Session; metadata?: App.Metadata; useRefresh?: boolean} = {}) => {
    if (metadata?.accessTokenOverride) return metadata.accessTokenOverride;
    if (useRefresh && session?.refresh) return session.refresh;
    if (session?.access) return session.access;
    return "";
};

export default new HoudiniClient({
    url: `${env.PUBLIC_GQL_URL}/graphql`,

    // uncomment this to configure the network call (for things like authentication)
    // for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
    fetchParams({session, metadata}) {
        return {
            headers: {
                authorization: `Bearer ${getAuthToken({
                    session: session ?? undefined,
                    metadata: metadata ?? undefined,
                    useRefresh: false,
                })}`,
            },
        };
    },
    throwOnError: {
        operations: ["all"],
        error: errors => {
            if (errors.some(e => e.message === "Unauthorized")) {
                // TODO: Check if JWT is actually expired, or if this is an authorization issue, not authentication
                // TODO: Check to see if we can use the refresh token, and then reload the page
                //          (e.g. goto with invalidateAll on current path).
                //          This would create a choppy-ish UX (e.g. page would "soft reload")
                //          But it would also prevent a user having to log in when they don't need to.
                clearAuthCookies();

                goto(`/auth/login?next=${encodeURI(window.location.pathname)}`);
            } else {
                console.error(errors);
            }
        },
    },
    plugins: [
        () => {
            return {
                beforeNetwork: async (ctx, {next}) => {
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
                            });
                            if (!result.data) {
                                throw new Error(
                                    result.errors?.map(e => e.message).join("\n") ?? "Refresh Login Response Empty",
                                );
                            }

                            ctx.session!.access = result.data.refreshLogin.access;
                            ctx.session!.refresh = result.data.refreshLogin.refresh;

                            if (browser) {
                                updateAuthCookies(result.data.refreshLogin);
                            } else {
                                // How do I set cookies here
                                console.log(
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
        },
        subscription(ctx =>
            createClient({
                url: `${env.PUBLIC_GQL_URL}/graphql`,
                connectionParams: {
                    authorization: ctx.session?.access ? `Bearer ${ctx.session.access}` : "",
                },
            }),
        ),
    ],
});
