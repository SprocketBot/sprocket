<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import GameCard from "./GameCard.svelte";

    export let scrim: CurrentScrim;
</script>


<GameCard game={scrim.games[0]} title="Best Of Teams:"/>
