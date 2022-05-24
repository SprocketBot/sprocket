<script lang="ts">
    import {currentScrim} from "$lib/api";
    import {Spinner} from "$lib/components";
</script>

<div class="flex flex-col items-center">
<Spinner/>
<div class="flex gap-4 w-full items-center">
    <p>{$currentScrim?.data?.currentScrim?.playerCount}</p>
    <progress class="progress progress-primary h-8"
              value={$currentScrim?.data?.currentScrim?.playerCount ?? 0}
              max={$currentScrim?.data?.currentScrim?.maxPlayers ?? 1}
    />
    <p>{$currentScrim?.data?.currentScrim?.maxPlayers}</p>
</div>
</div>

<style lang="postcss">

    p {
        @apply text-xl font-bold;
    }
</style>
