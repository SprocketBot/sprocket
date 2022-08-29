<script lang="ts">
    import type {Submission} from "$lib/api";
import SubmissionDetailModal from "./SubmissionDetailModal.svelte";

    export let submission: Submission;

    const scrimIdOrMatchId = submission.type === "SCRIM" ? submission.scrimId : submission.matchId;
    let detailModalOpen = false;
</script>

<tr on:click={() => { detailModalOpen = true }} class="cursor-pointer">
    <td>{submission.type}</td>
    <td>{scrimIdOrMatchId}</td>
    <td>{submission.creatorId}</td>
    <td>{submission.status}</td>
</tr>

<SubmissionDetailModal bind:visible={detailModalOpen} submission={submission} />
