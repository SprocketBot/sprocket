<script lang="ts">

    /*
    What is visible on this file is controlled from AvailableAdminView
    Bound boolean values for visible to variables in that file
    Dont forget dummy

     */
    let scrimManagementVisible = false;

    import {
        AvailableAdminView,
        AdminScrimTable,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
    } from "$lib/components";




</script>

<DashboardLayout>
    <DashboardCard title="The buttons of administration" class="col-span-6 xl:col-span-6 row-span-1">
        <AvailableAdminView bind:adminScrimManagementVisible={scrimManagementVisible}/>
    </DashboardCard>
    <DashboardCard class="col-span-3 xl:col-span-3" title="Uhhh is this thing on?">
        {#if scrimManagementVisible}
            <AdminScrimTable bind:visible={scrimManagementVisible}/>
        {/if}
    </DashboardCard>
</DashboardLayout>
