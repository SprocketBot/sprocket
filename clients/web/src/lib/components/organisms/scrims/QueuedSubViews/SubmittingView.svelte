<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {getReplayUploadStore} from "$lib/api/queries/ReplayUpload.store";
    import {ProgressStatus} from "$lib/utils/types/progress.types";

    export let scrim: CurrentScrim;
    if (!scrim) throw new Error();
    const progress = getReplayUploadStore(scrim.submissionId);
</script>


<section>
    <h2>Replay Submission Progress</h2>
    {#each Object.values($progress) as taskProgress (taskProgress.taskId)}
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
