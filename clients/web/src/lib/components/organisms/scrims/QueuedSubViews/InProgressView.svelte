<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import Portal from "$lib/components/abstract/Portal.svelte";
    import SubmitReplaysModal from "../modals/SubmitReplaysModal.svelte";

    export let scrim: CurrentScrim;

    let submitting: boolean = false;
</script>


<h2 class="mb-4">Time to Play!</h2>
<p class="text-accent font-bold tracking-wider">Don't forget to save replays!</p>
<table class="table">
    <thead>
        <tr>
            <th/>
            {#each scrim.games[0].teams as t, ti}
                <th colspan={t.players.length}>Team {ti + 1}</th>
            {/each}
        </tr>
    </thead>
    {#each scrim.games as game, gameIndex}
        <tr>
            <td>Game {gameIndex + 1}</td>
            {#each game.teams as team, teamIndex}
                {#each team.players as player}
                    <td class:alt={teamIndex % 2 === 0}>
                        {player.name}
                    </td>
                {/each}
            {/each}
        </tr>
    {/each}
</table>

<button on:click={() => { submitting = true }}>
    Submit Replays
</button>

<Portal>
    <SubmitReplaysModal bind:visible={submitting} submissionId={scrim.submissionGroupId}/>
</Portal>

<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }

    table {
        @apply text-center
    }

    th:not(:last-child):not(:empty) {
        @apply border-r-gray-500 border-r-2
    }

    button {
        @apply btn btn-primary;
    }
</style>
