<script lang="ts">
    import {onMount} from "svelte";
    import {browser} from "$app/env";
    import {session} from "$app/stores";

    import {chatwootSettings} from "./Chatwoot.constants";

    const {
        enabled, url, websiteToken,
    } = $session.config.chatwoot;

    let identifier: string;
    let hash: string;

    onMount(async () => {
        if (browser && enabled) {
            // Append protocol to url
            const _url = url.startsWith("http") ? url : `https://${url}`;

            // Fetch identifier and HMAC hash
            const res = await fetch("/auth/chatwoot");
            if (!res.ok) return;
            ({identifier, hash} = await res.json());

            (function() {
                const g = document.createElement("script");
                g.src = `${_url}/packs/js/sdk.js`;
                g.defer = true;
                g.async = true;
                document.body.append(g);
                g.onload = function() {
                    window.chatwootSettings = chatwootSettings;
                    window.chatwootSDK?.run({
                        websiteToken: websiteToken,
                        baseUrl: _url,
                    });
                };
            })();
        }
    });

    if (browser) {
        window.addEventListener("chatwoot:ready", () => {
            if (!$session.user || !window.$chatwoot || !identifier || !hash) return;

            window.$chatwoot.setUser(identifier, {
                name: $session.user.username,
                identifier_hash: hash,
            });
            // TODO support other orgs in the future
            window.$chatwoot.setLabel("org-mle");
            window.$chatwoot.setCustomAttributes({
                userId: $session.user.userId,
            });
        });
    }
</script>
