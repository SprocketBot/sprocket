<script lang="ts">
    import "../app.postcss";
    import {session} from "$app/stores";
    import {setContext} from "svelte";
    import {NavigationContextKey, type NavigationItem} from "$lib/types";
    import {initializeClient} from "$lib/api/client";
    import {
        AuthGuard, Chatwoot, ToastContainer,
    } from "$lib/components";

    setContext<NavigationItem[]>(NavigationContextKey, [
        {
            target: "/scrims",
            label: "Play",
        },
    ]);

    initializeClient($session);

</script>

<slot/>

<ToastContainer showTestButton={false}/>

<AuthGuard>
    <Chatwoot/>
</AuthGuard>
