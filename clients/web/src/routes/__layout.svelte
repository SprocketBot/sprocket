<script lang="ts">
    import "../app.postcss";
    import {session} from "$app/stores";
    import {setContext} from "svelte";
    import {NavigationContextKey, NavigationItem} from "$lib/types";
    import {ToastContainer} from "$lib/components";
    import {initializeClient} from "$lib/api/client";

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
