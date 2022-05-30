<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {getReplayUploadStore} from "$lib/api/queries/ReplayUpload.store";
    import {ProgressStatus} from "$lib/utils/types/progress.types";
    import MdErrorOutline from "svelte-icons/md/MdErrorOutline.svelte";
    import {resetSubmissionMutation} from "$lib/api";

    export let scrim: CurrentScrim;
    if (!scrim) throw new Error();
    const progressStore = getReplayUploadStore(scrim.submissionId);
    let progress;
    $: progress = Object.values($progressStore);

    async function resetSubmission() {
        await resetSubmissionMutation({
            submissionId: scrim.submissionId!,
        });
    }
</script>


<section>
    <h2>Replay Submission Progress</h2>

    {#if progress.some(p => p.status === ProgressStatus.Error)}
        <div class="alert alert-error">

            <p class="text-error-content">
                <span class="h-8"><MdErrorOutline/></span>
                Your submission encountered an error.
            </p>

            <button class="btn btn-outline" on:click={resetSubmission}>
                Try again
            </button>
        </div>
    {/if}
    {#each progress as taskProgress (taskProgress.taskId)}
        <div class="progress-card">
            <div class="flex justify-between">
                <span>{taskProgress.filename}</span>
                <span>{taskProgress.progress.message ?? ""}</span>
            </div>
            <progress
                    value={taskProgress.progress.value ?? 0}
                    max={100}
                    class:complete={taskProgress.status === ProgressStatus.Complete}
                    class:error={taskProgress.status === ProgressStatus.Error}></progress>
        </div>
    {/each}
</section>


<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }

    div.progress-card {
        @apply p-4 bg-base-100/50 rounded-lg;
    }

    section {
        @apply space-y-4;
    }

    progress {
        @apply progress progress-primary bg-base-100 h-4;

        &.complete {
            @apply progress-success;
        }

        &.error {
            @apply progress-error;
        }
    }
</style>
