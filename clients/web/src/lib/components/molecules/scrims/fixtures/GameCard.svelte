<script lang="ts">
    import type {CurrentScrim, SubmissionStatsData} from "$lib/api";

    export let title: string;
    export let game: CurrentScrim["games"][number] | SubmissionStatsData["games"][number];

    export let showCheckbox: boolean;
    export let checkboxValue: boolean;

</script>

<div class="bg-base-100/20 p-4 rounded-lg flex flex-col gap-2 relative">
    <h3 class="text-primary font-bold text-xl">{title}</h3>
    {#if showCheckbox}
        <input type="checkbox" bind:checked={checkboxValue} class="checkbox absolute right-4 checkbox-primary" />
    {/if}
    {#if typeof game.teams[0].won !== "undefined"}
        <div class="flex justify-between items-center text-center">
            {#each game.teams as team, teamIndex}
                <span class="flex-1 text-xl" class:text-primary={team.won} class:font-bold={team.won}>{team.score}</span>
                {#if teamIndex < game.teams.length - 1}
                    <div class="divider divider-horizontal"></div>
                {/if}

            {/each}
        </div>
    {/if}
    <div class="flex justify-between items-center text-center">
        {#each game.teams as team, teamIndex}
            <div class="flex-1 flex flex-col gap-2">
                {#each team.players as player}
                    <div class="bg-base-100/30 px-2 py-1 h-8 leading-6 rounded-lg w-full flex justify-between">
                        <span>{player.name}</span>
                        {#if typeof player.goals !== "undefined"}
                            <span class="font-bold">{player.goals} goals</span>
                        {/if}
                    </div>
                {/each}
            </div>
            {#if teamIndex < game.teams.length - 1}
                <div class="divider divider-horizontal">VS</div>
            {/if}
        {/each}
    </div>
</div>
