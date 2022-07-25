<script lang="ts">
    import {browser} from "$app/env";
    import {onMount} from "svelte";
    import {session} from "$app/stores";

    const {
        enabled, url, websiteToken,
    } = $session.config.chatwoot;

    onMount(() => {
        if (browser && enabled) {
            (function() {
                const g = document.createElement("script");
                g.src = `${url}/packs/js/sdk.js`;
                g.defer = true;
                g.async = true;
                document.body.append(g);
                g.onload = function() {
                    window.chatwootSDK?.run({
                        websiteToken: websiteToken,
                        baseUrl: url,
                    });
                };
            })();
        }
    });

    if (browser) {
        window.addEventListener("chatwoot:ready", () => {
            if (!$session.user || !window.$chatwoot) return;

            window.$chatwoot.setUser($session.user.userId.toString(), {
                name: $session.user.username,
            });
            window.$chatwoot.setLabel($session.user.org);
        });
    }
</script>
