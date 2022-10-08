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

<script lang="ts">
    import MdErrorOutline from "svelte-icons/md/MdErrorOutline.svelte";

    import type {Submission, SubmissionProgress} from "$lib/api";
    import {resetSubmissionMutation} from "$lib/api";
    import {Spinner} from "$lib/components";
    import {ProgressStatus} from "$lib/utils/types/progress.types";

    export let submission: Submission;
    let progress: SubmissionProgress[];
    $: progress = submission?.items.map(item => ({
        filename: item.originalFilename,
        ...item.progress,
    }));

    async function resetSubmission(): Promise<void> {
        await resetSubmissionMutation({
            submissionId: submission.id,
        });
    }
</script>

<section>
    <h2>Replay Submission Progress</h2>

    {#if progress.some(p => p.status === ProgressStatus.Error)}
        <div class="alert alert-error">
            <p class="text-error-content">
                <span class="h-8"><MdErrorOutline /></span>
                Your submission encountered an error.
            </p>

            <button class="btn btn-outline" on:click={resetSubmission}>
                Try again
            </button>
        </div>
    {/if}
    {#if submission.status === "VALIDATING"}
        <div class="alert alert-success">
            <p class="text-error-content">
                <span class="h-8"><Spinner /></span>
                Validating Replays...
            </p>
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
                class:error={taskProgress.status === ProgressStatus.Error}
            />
        </div>
    {/each}
</section>
