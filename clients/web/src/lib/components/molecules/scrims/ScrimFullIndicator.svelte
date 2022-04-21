<script lang="ts">
    import {currentScrim} from "$lib/api";
</script>


<div class="">
    <p>{$currentScrim?.data?.currentScrim?.playerCount}</p>
    <progress class="progress progress-primary h-8"
              value={$currentScrim?.data?.currentScrim?.playerCount ?? 0}
              max={$currentScrim?.data?.currentScrim?.maxPlayers ?? 1}
    />
    <p>{$currentScrim?.data?.currentScrim?.maxPlayers}</p>
</div>

<style lang="postcss">
    div {
        @apply flex gap-4 w-full items-center;
    }
    p {
        @apply text-xl font-bold;
    }
</style>