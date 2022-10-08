<script lang="ts">
    import cookies from "js-cookie";
    import {onMount} from "svelte";
    
    import {browser} from "$app/env";
    import {goto} from "$app/navigation";
    import {session} from "$app/stores";
    import {constants} from "$lib/utils";

    onMount(() => {
        if (browser) {
            cookies.remove(constants.auth_cookie_key);
            window.$chatwoot?.reset();
            $session.user = undefined;
            goto("/").catch(console.error);
        }
    });

</script>