<script lang="ts">
    import type {CurrentScrim} from "$lib/api";

    import GameCard from "./GameCard.svelte";

    export let scrim: CurrentScrim;
</script>

<ul class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
    {#each scrim.games as game, gameIndex}
        <li><GameCard {game} title="Game {gameIndex + 1}" /></li>
    {/each}
</ul>
