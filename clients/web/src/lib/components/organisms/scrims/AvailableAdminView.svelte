<script lang="ts">
    import {
        AdminScrimTable, DashboardLayout, DashboardCard,
    } from "$lib/components";
import AdminPlayerTable from "../../molecules/scrims/AdminPlayerTable.svelte";

    // Is this visible?
    export let visible = true;

    // State Machine of badness
    export let adminScrimManagementVisible = false;
    export let adminPlayerManagementVisible = false;
    export let adminLeagueManagementVisible = false;


    const handleScrimManagementBtn = () => {
        adminScrimManagementVisible = true;
        adminPlayerManagementVisible = false;
    };

    const handlePlayerManagementBtn = () => {
        adminPlayerManagementVisible = true;
        adminScrimManagementVisible = false;
    };

    const handleLeagueManagementBtn = () => {
        adminLeagueManagementVisible = true;
    };

</script>


<div class="items-center">

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

    <DashboardCard title="" class="col-span-3 xl:col-span-6">
        {#if adminScrimManagementVisible}
            <AdminScrimTable/>
        {/if}
        {#if adminPlayerManagementVisible}
            <AdminPlayerTable bind:visible={adminPlayerManagementVisible} />
        {/if}
    </DashboardCard>


</div>


