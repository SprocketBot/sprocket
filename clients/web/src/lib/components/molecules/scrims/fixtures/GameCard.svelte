<script lang="ts">
    import type {CurrentScrim} from "$lib/api";

    export let title: string;
    export let game: CurrentScrim["games"][number];
</script>

<div class="bg-base-100/20 p-4 rounded-lg flex flex-col gap-2">
    <h3 class="text-primary font-bold text-xl">{title}</h3>
    <div class="flex justify-between items-center text-center">
        {#each game.teams as team, teamIndex}
            <div class="flex-1">
                {#each team.players as player}
                    <span class="bg-base-100/30 px-2 py-1 h-8 leading-6 rounded-lg w-full block">{player.name}</span>
                {/each}
            </div>
            {#if teamIndex < game.teams.length - 1}
                <div class="divider divider-horizontal">VS</div>
            {/if}
        {/each}
    </div>
</div>
