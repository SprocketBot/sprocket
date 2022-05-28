<script lang="ts">

    /*
    What is visible on this file is controlled from AvailableAdminView
    Bound boolean values for visible to variables in that file
    Dont forget dummy

     */
    let admin = false;

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
    <DashboardCard class="col-span-6 xl:col-span-6 row-span-1">
        <AvailableAdminView bind:adminScrimManagementVisible={admin}/>
    </DashboardCard>
    <DashboardCard class="col-span-3 xl:col-span-3" title="Uhhh is this thing on?">
        {#if admin}
            <AdminScrimTable bind:visible={admin}/>
        {/if}
    </DashboardCard>
</DashboardLayout>


<!--{#if adminPlayerManagementVisible}-->
<!--    //TODO: player management-->
<!--{/if}-->

<style lang="postcss">

    h2 {
        @apply text-4xl mb-8;
    }
</style>
