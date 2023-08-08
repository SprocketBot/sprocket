<script lang="ts">
    import type {
        Submission, SubmissionProgress,
    } from "$lib/api";
    import MdErrorOutline from "svelte-icons/md/MdErrorOutline.svelte";
    import {ProgressStatus} from "$lib/api";
    import {ResetSubmissionStore} from '$houdini';
    import {Spinner} from "$lib/components";
    
    export let submission: Submission;
    let progress: SubmissionProgress[] = [];

    for (let i=0; i<submission?.items.length; i++) {
        let item = submission.items[i];
        let prog = item.progress;
        prog.filename = item.originalFilename;
        
        progress.push(prog);
    }
    
    async function resetSubmission() {
        const mutator = new ResetSubmissionStore();
        await mutator.mutate({submissionId: submission.id});
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
    {#if submission.status === "VALIDATING"}
        <div class="alert alert-success">
            <p class="text-error-content">
                <span class="h-8"><Spinner/></span>
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
                class:error={taskProgress.status === ProgressStatus.Error}></progress>
        </div>
    {/each}
</section>