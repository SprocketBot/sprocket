<script>
    import {browser} from "$app/env";
    import {onMount} from "svelte";

    onMount(() => {
        if (browser) {
            (function(d, t) {
                const BASE_URL = "https://chatwoot.spr.ocket.cloud";
                const g = d.createElement(t),
                      s = d.getElementsByTagName(t)[0];
                g.src = `${BASE_URL}/packs/js/sdk.js`;
                g.defer = true;
                g.async = true;
                s.parentNode.insertBefore(g, s);
                g.onload = function() {
                    window.chatwootSDK.run({
                        websiteToken: "2A4URw1JquVYpjKGkpzWEYQH",
                        baseUrl: BASE_URL,
                        darkMode: "auto",
                    });
                };
            })(document, "script");
        }
    });
</script>
