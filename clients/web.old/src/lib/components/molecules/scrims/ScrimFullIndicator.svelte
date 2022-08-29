<script lang="ts">
    import {currentScrim} from "$lib/api";
    import {Progress, Spinner} from "$lib/components";
</script>

<div class="flex flex-col items-center">
<Spinner/>
    <Progress max={$currentScrim?.data?.currentScrim?.maxPlayers}
            value={$currentScrim?.data?.currentScrim?.playerCount}
              />
</div>

<style lang="postcss">

    p {
        @apply text-xl font-bold;
    }
</style>
