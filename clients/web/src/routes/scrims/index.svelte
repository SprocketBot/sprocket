<script lang="ts">
    import {currentScrim} from "$lib/api";
    import type {MetricsResult} from "$lib/api/queries/ScrimMetrics.store";
    import {scrimMetrics} from "$lib/api/queries/ScrimMetrics.store";

    import {
        AvailableScrimsView, BetterDashboardLayout, BigNumber, DashboardCard, QueuedView, DashboardNumberCard
    } from "$lib/components";

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

<BetterDashboardLayout>
    <DashboardCard width={5} height={3}>
        {#if $currentScrim.fetching}
            Loading...
        {:else if $currentScrim.data?.currentScrim}
            <QueuedView/>
        {:else}
            <AvailableScrimsView/>
        {/if}
    </DashboardCard>
    <DashboardNumberCard title="Scrims in the last hour"
                         value={metrics?.completedScrims ?? 0}
                         description="{Math.abs(activityChange)}% {activityChange > 0 ? 'more' : 'less'} than previous hour"/>
    <DashboardNumberCard title="Pending Scrims"
                         value={metrics?.pendingScrims ?? 0}/>
    <DashboardNumberCard title="Active Players"
                         value={metrics?.totalPlayers ?? 0}/>

</BetterDashboardLayout>

<style lang="postcss">

    h2 {
        @apply text-4xl mb-8;
    }
</style>
