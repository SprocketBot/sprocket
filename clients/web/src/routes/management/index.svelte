<script lang="ts">
    import {currentScrim} from "$lib/api";
    import type {MetricsResult} from "$lib/api/queries/ScrimMetrics.store";
    import {scrimMetrics} from "$lib/api/queries/ScrimMetrics.store";

    import {
        AvailableScrimsView,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
    } from "$lib/components";
import DashboardHeader from "../../lib/components/molecules/dashboard/DashboardHeader.svelte";

    let metrics: MetricsResult["metrics"];
    $: metrics = $scrimMetrics.data?.metrics;

    let activityChange: number = 0;

    function calculateActivityChange() {
        const prev = metrics.previousCompletedScrims;
        const cur = metrics?.completedScrims;
        if (metrics?.completedScrims && metrics.previousCompletedScrims) {
            const change = cur - prev;
            const ratio = change / Math.max(prev, 1);
            console.log({
                change, cur, prev, ratio,
            });

            activityChange = Math.round(ratio * 100);
        }
    }

    $: if (typeof metrics?.completedScrims === "number" || typeof metrics?.previousCompletedScrims === "number") {
        calculateActivityChange();
    }
</script>

<DashboardLayout>
    <DashboardCard class="col-span-6 xl:col-span-2 row-span-1">
        HAI
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
