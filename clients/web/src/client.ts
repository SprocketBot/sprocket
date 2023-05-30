import {env} from "$env/dynamic/public";
import {HoudiniClient} from "$houdini";
import {SubscriptionClient} from "subscriptions-transport-ws";
import {subscription} from "$houdini/plugins";
import {goto} from "$app/navigation";
import {getAuthCookies, clearAuthCookies} from "$lib/api";
import {redirect} from "@sveltejs/kit";
import { refreshAuthPlugin } from "./houdini/refresh-auth.plugin";

const getAuthToken = ({
    session,
    metadata,
    useRefresh,
}: {session?: App.Session; metadata?: App.Metadata; useRefresh?: boolean} = {}) => {
    if (metadata?.accessTokenOverride) return metadata.accessTokenOverride;
    if (useRefresh && session?.refresh) return session.refresh;
    if (session?.access) return session.access;
    const cookies = getAuthCookies();
    if (cookies.access) return cookies.access;
    return "";
};

export default new HoudiniClient({
    url: `${env.PUBLIC_GQL_URL}/graphql`,

    // uncomment this to configure the network call (for things like authentication)
    // for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
    fetchParams({session, metadata, document}) {
        const authToken = getAuthToken({
            session: session ?? undefined,
            metadata: metadata ?? undefined,
            useRefresh: false,
        });
        return {
            headers: {
                authorization: `Bearer ${authToken}`,
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

                if (typeof window !== "undefined") goto(`/auth/login?next=${encodeURI(window.location.pathname)}`);
                else {
                    throw redirect(307, "/auth/login");
                }
            } else {
                console.error(errors);
            }
        },
    },
    plugins: [
        refreshAuthPlugin,
        subscription(
            ctx => {
                const c = new SubscriptionClient(`${env.PUBLIC_GQL_URL.replace("http", "ws")}/graphql`, {
                    reconnect: true,
                    lazy: true,
                });
                return {
                    subscribe(payload, handlers) {
                        const {unsubscribe} = c
                            .request({
                                ...payload,
                                context: {authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : undefined},
                            })
                            .subscribe(handlers);
                        return unsubscribe;
                    },
                };
            },
        ),
    ],
});
