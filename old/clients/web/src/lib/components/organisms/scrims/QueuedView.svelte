<script lang="ts">
    import type {CurrentScrim, SubmissionStoreValue} from "$lib/api";
    import {currentScrim, SubmissionStore} from "$lib/api";
    import {SubmissionView} from "$lib/components";
    import PendingView from "./QueuedSubViews/PendingView.svelte";
    import PoppedView from "./QueuedSubViews/PoppedView.svelte";
    import InProgressView from "./QueuedSubViews/InProgressView.svelte";
    import LockedView from "./QueuedSubViews/LockedView.svelte";

    let scrim: CurrentScrim | undefined;
    $: scrim = $currentScrim?.data?.currentScrim;

    let submissionStore: SubmissionStore | undefined;
    $: if (scrim?.submissionId) {
        submissionStore = new SubmissionStore(scrim.submissionId);
    }
    let submission: SubmissionStoreValue["submission"] | undefined;
    $: if ($submissionStore) submission = $submissionStore?.data?.submission;
</script>

{#if scrim}
    {#if scrim.status === "PENDING"}
        <PendingView scrim={scrim}/>
    {:else if scrim.status === "POPPED"}
        <PoppedView scrim={scrim}/>
    {:else if scrim.status === "IN_PROGRESS"}
        {#if !submission || submission.status === "REJECTED"}
            <InProgressView scrim={scrim} {submission}/>
        {:else if submission}
            <SubmissionView {submission} />
        {/if}
    {:else if scrim.status === "LOCKED"}
        <LockedView scrim={scrim}/>
    {:else}
        {scrim.status}
    {/if}
{/if}


