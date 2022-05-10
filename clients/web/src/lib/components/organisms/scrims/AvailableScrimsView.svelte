<script lang="ts">
    import {pendingScrims} from "$lib/api";

    import {ScrimTable} from "$lib/components";

    import {TeamAuth} from "$lib/components";
</script>

<h2>Available Scrims</h2>

{#if $pendingScrims.fetching}
    Loading...
{:else}
    <ScrimTable scrims={$pendingScrims.data?.pendingScrims ?? []}/>
{/if}

<TeamAuth expectedTeam="1234">
    <h1>You are not authorized gancho!</h1>
    <h1 slot="authorized">You're authorized!</h1>
</TeamAuth>

<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>