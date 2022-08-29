<script lang="ts">
    import type {CurrentScrim, SubmissionStatsData} from "$lib/api";

    export let title: string;
    export let game: CurrentScrim["games"][number] | SubmissionStatsData["games"][number];

    export let showCheckbox: boolean;
    export let checkboxValue: boolean;
    export let showResult: boolean = false;
</script>

<div class="bg-base-100/20 p-4 rounded-lg flex flex-col gap-2 relative">
    <h3 class="text-primary font-bold text-xl">{title}</h3>
    {#if showCheckbox}
        <input type="checkbox" bind:checked={checkboxValue} class="checkbox absolute right-4 checkbox-primary checkbox-lg lg:checkbox-md" />
    {/if}
    {#if typeof game.teams[0].won !== "undefined"}
        <div class="flex justify-between items-center text-center">
            {#each game.teams as team, teamIndex}
                <span class="flex-1 text-xl block text-center" class:text-primary={team.won} class:font-bold={team.won}>{team.score}</span>
                {#if teamIndex < game.teams.length - 1}
                    <div class="divider divider-horizontal"></div>
                {/if}

            {/each}
        </div>
    {/if}
    <div class="flex justify-between items-center text-center">
        {#each game.teams as team, teamIndex}
            <div class="flex-1 flex flex-col gap-2  min-w-0">
                {#each team.players as player}
                    <div class="bg-base-100/30 px-4 py-1 h-8 leading-6 rounded-lg w-full flex justify-between min-w-0">
                        <span class:text-left={showResult} class="flex-1 text-ellipsis min-w-0 overflow-hidden whitespace-nowrap">{player.name}</span>
                        {#if showResult}
                            <span class="font-bold text-ellipsis text-right">{player.goals ?? 0} goals</span>
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
