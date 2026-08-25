<script lang="ts">
    import type {PendingScrim} from "$lib/api";
    import {screamingSnakeToHuman} from "$lib/utils";

    export let scrim: PendingScrim;
    export let joinScrim: (scrim: PendingScrim) => void;
</script>


<div class="bg-gray-800 rounded-xl p-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 class="text-primary font-bold text-lg">Scrim</h2>
        <button class="btn btn-outline btn-sm w-full sm:w-auto" on:click={() => { joinScrim(scrim) }}>Join</button>
    </div>
    
    <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <span class="text-gray-400">Game</span>
        <span>{scrim.gameMode.game.title}</span>
    
        <span class="text-gray-400">Skill Group</span>
        <span>{scrim.skillGroup?.profile?.description ?? ""}</span>

        <span class="text-gray-400">Game Mode</span>
        <span>{scrim.gameMode.description}</span>
    
        <span class="text-gray-400">Scrim Type</span>
        <span>{screamingSnakeToHuman(scrim.settings.mode)}</span>
    
        <span class="text-gray-400">Players</span>
        <span>{scrim.playerCount} / {scrim.maxPlayers}</span>
    
        <span class="text-gray-400">Mode</span>
        <span>{scrim.settings.competitive ? "Competitive" : "Casual"}</span>
    </div>
</div>


<style lang="postcss">
    /* Styles removed - using Tailwind utility classes directly in template */
</style>