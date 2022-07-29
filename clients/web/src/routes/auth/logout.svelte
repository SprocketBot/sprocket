<script lang="ts">
    import {browser} from "$app/env";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import cookies from "js-cookie";
    import {constants} from "$lib/utils";
    import {session} from "$app/stores";

    onMount(() => {
        if (browser) {
            cookies.remove(constants.auth_cookie_key);
            window.$chatwoot?.reset();
            $session.user = undefined;
            goto("/").catch(console.error);
        }
    });

</script>