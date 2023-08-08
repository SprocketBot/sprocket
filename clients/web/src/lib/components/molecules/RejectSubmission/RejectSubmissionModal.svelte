<script lang="ts">
    import {RejectSubmissionStore} from "$houdini";
    import {Modal} from "$lib/components";

    export let open: boolean = false;
    export let submissionId: string;

    let reason: string;

    const reject = async () => {
        const mutator = new RejectSubmissionStore();
        await mutator.mutate({submissionId, reason});
    };
</script>


<Modal title="Reject Replays" bind:open>
    <section slot="body">
        <p>Please describe why you are rejecting these replays</p>
        <p>Be sure to include any relevant details about <strong>which replays are incorrect</strong> and <strong>how they are incorrect</strong>.</p>
        <p>Rejecting the submission will get rid of these uploaded replays and allow new replays to be uploaded.</p>
        
        <textarea placeholder="Replays 1 and 3 are wrong because..." bind:value={reason} />

        <button on:click={reject}>Reject</button>
    </section>
</Modal>