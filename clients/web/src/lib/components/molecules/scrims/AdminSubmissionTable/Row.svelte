<script lang="ts">
    import {createEventDispatcher} from "svelte";

    import type {Submission} from "$lib/api";

    export let submission: Submission;

    const scrimIdOrMatchId =
        submission.type === "SCRIM" ? submission.scrimId : submission.matchId;

    const dispatch = createEventDispatcher();
    const onClick = (): void => {
        dispatch("click");
    };
</script>

<tr on:click={onClick} class="cursor-pointer">
    <td>{submission.id}</td>
    <td>{submission.type}</td>
    <td>{scrimIdOrMatchId}</td>
    <td>{submission.creatorId}</td>
    <td>{submission.status}</td>
</tr>
