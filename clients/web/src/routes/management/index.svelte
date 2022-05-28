<script lang="ts">

    /*
    Top Dashboard Card calls AvailableAdminView.
    AvailableAdminView contains state mechanism that determines what is presented in lower DashboardCard
    Example: scrimManagement Visible is bound to bool in AdminView which is updated by buttons in that component
        When that is updated it changes the value here which is also bound to AdminScrimTable and that will appear.
     */
    let scrimManagementVisible = false;

    import {
        AvailableAdminView,
        AdminScrimTable,
        DashboardLayout,
        DashboardCard,
    } from "$lib/components";

</script>

<DashboardLayout>
    <DashboardCard title="" class="col-span-6 xl:col-span-6 row-span-1">
        <AvailableAdminView bind:adminScrimManagementVisible={scrimManagementVisible}/>
    </DashboardCard>
    <DashboardCard class="col-span-3 xl:col-span-6" title="">
        {#if scrimManagementVisible}
            <AdminScrimTable bind:visible={scrimManagementVisible}/>
        {/if}
    </DashboardCard>
</DashboardLayout>
