<script lang="ts">


    let selectedPlayer;

    import {
        AdminScrimTable,
        AdminPlayerTable,
        DashboardLayout,
        DashboardCard,
    } from "$lib/components";

</script>

<DashboardLayout>

    
    <DashboardCard title="" class="col-span-6 xl:col-span-5 row-span-3">
        <h2>Scrim Management</h2>
        <div class=" flex justify-center">
            <AdminScrimTable bind:selectedPlayer/>
        </div>
    </DashboardCard>
    <DashboardCard title="" class="col-span-6 xl:col-span-5 row-span-3">
        <h2>Player Management</h2>
        <div class=" flex justify-center">
            <AdminPlayerTable bind:selectedPlayer/>
        </div>
    </DashboardCard>


</DashboardLayout>

<style lang="postcss">

    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>