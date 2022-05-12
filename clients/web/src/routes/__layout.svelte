<script lang="ts">
    import "../app.postcss";
    import {setContext} from "svelte";
    import {NavigationContextKey} from "$lib/types";
    import type {NavigationItem} from "$lib/types/Navigation.js";
    import {initializeClient} from "$lib/api/client";
    import {session} from "$app/stores";
    import {ToastContainer} from "$lib/components"

    setContext<NavigationItem[]>(NavigationContextKey, [
        {
            target: "/scrims",
            label: "Performance",
        },
        {
            target: "/scrims/queue",
            label: "Play",
        },
    ]);

    initializeClient($session);
</script>

<slot/>

<ToastContainer showTestButton={false}/>
