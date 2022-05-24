<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {currentScrim} from "$lib/api";
    import PendingView from "./QueuedSubViews/PendingView.svelte";
    import PoppedView from "./QueuedSubViews/PoppedView.svelte";
    import InProgressView from "./QueuedSubViews/InProgressView.svelte";
    import SubmissionView from "./QueuedSubViews/SubmissionView.svelte";
    import RatificationView from "./QueuedSubViews/RatificationView.svelte";


    let data: CurrentScrim | undefined;
    $: data = $currentScrim?.data?.currentScrim;

</script>

{#if data}
    {#if data.status === "PENDING"}
        <PendingView scrim={data}/>
    {:else if data.status === "POPPED"}
        <PoppedView scrim={data}/>
    {:else if data.status === "IN_PROGRESS"}
        <InProgressView scrim={data}/>
    {:else if data.status === "SUBMITTING"}
        <SubmissionView scrim={data}/>
    {:else if data.status === "RATIFYING"}
        <RatificationView scrim={data}/>
    {:else}
        {data.status}
    {/if}
{/if}


