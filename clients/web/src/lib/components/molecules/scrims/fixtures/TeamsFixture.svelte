<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import GameCard from "./GameCard.svelte";

    export let scrim: CurrentScrim;
</script>


{#if scrim.gameMode.description === "Duel"}
    <GameCard game={scrim.games[0]} title="Duel Series - All 5 Games MUST be played"/>
    {:else }
    <GameCard game={scrim.games[0]} title="Teams"/>
{/if}

