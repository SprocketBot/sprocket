<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import GameCard from "./GameCard.svelte";

    export let scrim: CurrentScrim;
    const numberOfGames: number = scrim.games.length;
</script>


    
    <GameCard game={scrim.games[0]} title="Teams Series - Play All {numberOfGames} Games"/>


