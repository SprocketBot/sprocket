<script lang="ts">
    import {currentScrim} from "$lib/api";
    import type {MetricsResult} from "$lib/api/queries/ScrimMetrics.store";
    import {scrimMetrics} from "$lib/api/queries/ScrimMetrics.store";

    import {
        AvailableAdminView,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
    } from "$lib/components";
import DashboardHeader from "../../lib/components/molecules/dashboard/DashboardHeader.svelte";



</script>

<DashboardLayout>
    <DashboardCard class="col-span-6 xl:col-span-6 row-span-1">
        <AvailableAdminView/>
    </DashboardCard>
    <DashboardCard class="col-span-3 xl:col-span-3" title="Uhhh is this thing on?">
        This is the new Sprocket scrim management interface. I don't know whatd
        I'm doing but they tell me that's ok. 
    </DashboardCard>

</DashboardLayout>

<style lang="postcss">

    h2 {
        @apply text-4xl mb-8;
    }
</style>
