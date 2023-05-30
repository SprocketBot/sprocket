<script lang="ts">
    import {OpenScrimsSubStore} from "$houdini";
    import type {LayoutData} from "./$types";
    import {onMount} from "svelte";
    import { OpenScrimsLiveStore, SetOpenScrimsContext } from "$lib/api";
    export let data: LayoutData;

    const openScrimsSubscription = new OpenScrimsSubStore();

    onMount(() => {
        openScrimsSubscription.listen();
        return () => openScrimsSubscription.unlisten();
    });
    SetOpenScrimsContext(
        OpenScrimsLiveStore(data.openScrims, openScrimsSubscription)
    );
</script>

<slot />
