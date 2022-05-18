<script lang="ts">
    import "../app.postcss";
    import {setContext} from "svelte";
    import {NavigationContextKey} from "$lib/types";
    import type {NavigationItem} from "$lib/types/Navigation.js";
    import {initializeClient} from "$lib/api/client";
    import {session} from "$app/stores";
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
