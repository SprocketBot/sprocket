<script lang="ts">
    import {pendingScrims} from "$lib/api";

    import {ScrimTable} from "$lib/components";
</script>

<h2>Available Scrims</h2>

{#if $pendingScrims.fetching}
    Loading...
{:else}
    <ScrimTable scrims={$pendingScrims.data?.pendingScrims ?? []}/>
{/if}


<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>