<script lang="ts">
    import {ScrimManagementModal} from "./modals";
    import {DashboardCard} from "$lib/components";

    // Is this visible?
    export let visible = true;

    //State Machine of badness
    export let adminScrimManagementVisible = false;
    export let adminPlayerManagementVisible = false;
    export let adminLeagueManagementVisible = false;
    export let adminScrimsInView = [];

    const handleScrimManagementBtn = () => {
        adminScrimManagementVisible = true;
    };

    const handlePlayerManagementBtn = () => {
        adminPlayerManagementVisible = true;
    };

    const handleLeagueManagementBtn = () => {
        adminLeagueManagementVisible = true;
    };

</script>

<h2 class="justify-center">Admin Menu</h2>

<div class="btn-group">

    <button class="btn btn-primary btn-wide "  on:click={handleScrimManagementBtn}>
        Scrim Management
    </button>
    <button class="btn btn-secondary btn-wide " on:click={handlePlayerManagementBtn}>
        Player Management
    </button>
    <button class="btn btn-primary btn-wide " on:click={handleLeagueManagementBtn}>
        League Management
    </button>
    <button class="btn btn-secondary btn-wide ">
        Shuk Management
    </button>

</div>
{#if adminScrimManagementVisible}

{/if}

<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>