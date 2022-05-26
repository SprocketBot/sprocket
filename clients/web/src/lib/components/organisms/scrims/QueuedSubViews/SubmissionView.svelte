<script lang="ts">
    import {SubmissionStore} from "$lib/api";

    export let submissionId: string;
    const submission = new SubmissionStore(submissionId);
</script>

{#each $submission.getSubmissionTasks as taskId}
    {taskId}
{/each}
