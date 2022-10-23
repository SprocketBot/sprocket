<script lang="ts">
    import {
        type Submission,
        activeSubmissionsStore,
        resetSubmissionMutation,
    } from "$lib/api";
    import {Modal} from "$lib/components";

    export let submission: Submission;
    export let visible = false;

    const resetSubmission = async (): Promise<void> => {
        await resetSubmissionMutation({submissionId: submission.id});

        // Close modal and refresh submissions table
        visible = false;
        activeSubmissionsStore.invalidate();
    };
</script>

<Modal title="Submission Detail" bind:visible id="submission-detail-modal">
    <pre slot="body">{JSON.stringify(submission, null, 2)}</pre>

    <div class="w-full flex flex-col justify-center" slot="actions">
        <button
            type="button"
            on:click={resetSubmission}
            class="btn btn-primary btn-wide flex mx-auto mb-4">Reset</button
        >
    </div>
</Modal>
