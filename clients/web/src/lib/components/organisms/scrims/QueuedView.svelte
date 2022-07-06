<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {currentScrim, SubmissionStore} from "$lib/api";
    import {Spinner, SubmissionView} from "$lib/components";
    import PendingView from "./QueuedSubViews/PendingView.svelte";
    import PoppedView from "./QueuedSubViews/PoppedView.svelte";
    import InProgressView from "./QueuedSubViews/InProgressView.svelte";
    import RatificationView from "../RatificationView.svelte";
    import LockedView from "./QueuedSubViews/LockedView.svelte";


    let data: CurrentScrim | undefined;
    $: data = $currentScrim?.data?.currentScrim;

    let submissionStore: SubmissionStore | undefined;
    $: if (data?.submissionId) {
        submissionStore = new SubmissionStore(data.submissionId);
    }
</script>

{#if data}
    {#if data.status === "PENDING"}
        <PendingView scrim={data}/>
    {:else if data.status === "POPPED"}
        <PoppedView scrim={data}/>
    {:else if data.status === "IN_PROGRESS"}
        <InProgressView scrim={data} submission={$submissionStore?.data?.submission}/>
    {:else if data.status === "SUBMITTING"}
        {#if $submissionStore?.data?.submission}
            <SubmissionView submission={$submissionStore?.data?.submission} submissionId={data.submissionId}/>
        {:else}
            <div class="h-20">
                <Spinner/>
            </div>
        {/if}
    {:else if data.status === "RATIFYING"}
        {#if $submissionStore?.data?.submission}
            <RatificationView submission={$submissionStore?.data?.submission} submissionId={data.submissionId}/>
        {:else}
            <div class="h-20">
                <Spinner/>
            </div>
        {/if}
    {:else if data.status === "LOCKED"}
        <LockedView scrim={data}/>
    {:else}
        {data.status}
    {/if}
{/if}


