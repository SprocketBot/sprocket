<script lang="ts">
    import {AvailableScrimsView} from "$lib/components";

    let adminScrimTableVisible = false;
    import {
        AvailableAdminView,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
    } from "$lib/components";
import DashboardHeader from "../../lib/components/molecules/dashboard/DashboardHeader.svelte";
    import AdminScrimTable from "../../lib/components/molecules/scrims/AdminScrimTable.svelte";



</script>

<DashboardLayout>
    <DashboardCard class="col-span-6 xl:col-span-6 row-span-1">
        <AvailableAdminView/>
    </DashboardCard>
    <DashboardCard class="col-span-3 xl:col-span-3" title="Uhhh is this thing on?">


    </DashboardCard>

</DashboardLayout>

{#if adminScrimTableVisible}
    <AdminScrimTable bind:visible={adminScrimTableVisible}/>
{/if}

<style lang="postcss">

    h2 {
        @apply text-4xl mb-8;
    }
</style>
