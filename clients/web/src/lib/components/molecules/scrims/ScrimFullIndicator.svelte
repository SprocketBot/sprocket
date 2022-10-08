<style lang="postcss">
    p {
        @apply text-xl font-bold;
    }
</style>

<script lang="ts">
    import {currentScrim} from "$lib/api";
    import {Progress, Spinner} from "$lib/components";
</script>

<div class="flex flex-col items-center">
    <Spinner class="h-12" />
    <Progress
        max={$currentScrim?.data?.currentScrim?.maxPlayers}
        value={$currentScrim?.data?.currentScrim?.playerCount}
    />
</div>
