<script lang="ts">
    import {RejectSubmissionMutation} from "../../../../api/mutations/scrims";
    import {Modal} from "../../../atoms";

    export let visible: boolean = false;
    export let submissionId: string;

    let reason: string;

    const reject = async () => {
        await RejectSubmissionMutation({submissionId, reason});
    };
</script>


<Modal title="Reject Replays" bind:visible id="reject-submission-modal">
    <section slot="body">
        <p>Please describe why you are rejecting these replays</p>
        <p>Be sure to include any relevant details about <strong>which replays are incorrect</strong> and <strong>how they are incorrect</strong>.</p>
        <p>Rejecting the submission will get rid of these uploaded replays and allow new replays to be uploaded.</p>
        
        <textarea placeholder="Replays 1 and 3 are wrong because..." bind:value={reason} />

        <button on:click={reject}>Reject</button>
    </section>
</Modal>



<style lang="postcss">
    section {
        @apply flex flex-col items-center gap-3;
    }

    p {
        @apply w-full;
    }

    textarea {
        @apply textarea textarea-error w-full mt-4;
    }

    button {
        @apply btn btn-error;
    }
</style>