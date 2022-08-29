<script lang="ts">
    import type {Submission} from "$lib/api";

    export let submission: Submission;

    const scrimIdOrMatchId = submission.type === "SCRIM" ? submission.scrimId : submission.matchId;
</script>

<tr>
    <td>{submission.type}</td>
    <td>{scrimIdOrMatchId}</td>
    <td>{submission.creatorId}</td>
    <td>{submission.status}</td>
</tr>
