<script lang="ts">
    import type {Submission} from "$lib/api";
    import {createEventDispatcher} from "svelte";

    export let submission: Submission;

    const scrimIdOrMatchId = submission.type === "SCRIM" ? submission.scrimId : submission.matchId;

    const dispatch = createEventDispatcher();
    const onClick = () => {
        dispatch("click");
    };
</script>

<tr>
    <td>{submission.id}</td>
    <td>{submission.type}</td>
    <td>{scrimIdOrMatchId}</td>
    <td>{submission.creatorId}</td>
    <td>{submission.status}</td>
    <td>
        <button type="button" class="btn btn-xs btn-primary" on:click={onClick}>Details</button>
    </td>
</tr>
