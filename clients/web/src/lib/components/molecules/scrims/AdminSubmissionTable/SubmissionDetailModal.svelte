<script lang="ts">
    import type {Submission} from "$lib/api";
    import {Modal} from "$lib/components";

    export let submission: Submission;
    export let visible = false;
</script>


<Modal title="Submission Detail" bind:visible id="submission-detail-modal">
    <pre slot="body">{JSON.stringify(submission, null, 2)}</pre>
</Modal>
