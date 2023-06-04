import {onMount} from "svelte";
import {RefreshLoginStore} from "$houdini";
import {getAuthCookies, updateAuthCookies} from "./auth-cookies";

export const authIntervalRefresh = () =>
    onMount(() => {
        const refreshStore = new RefreshLoginStore();

        const refreshAuth = async () => {
            const {refresh} = getAuthCookies();
            const r = await refreshStore.mutate(null, {metadata: {accessTokenOverride: refresh}});
            if (!r.data) return;
            console.debug("Auth Refreshed");
            updateAuthCookies(r.data?.refreshLogin);
        };

        // Refresh auth token every 2 minutes
        const i = setInterval(refreshAuth, 1000 * 60 * 2);
        refreshAuth();
        return () => clearInterval(i);
    });
