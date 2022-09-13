<script lang="ts">
    import {
        currentScrim, scrimsDisabled, scrimMetrics,
    } from "$lib/api";
    import type {MetricsResult} from "$lib/api";


    import {
        AvailableScrimsView,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
        DisabledView,
        Spinner,
    } from "$lib/components";

    let metrics: MetricsResult["metrics"];
    $: metrics = $scrimMetrics.data?.metrics;
    let activityChange: string = "";

    let scrimsAreDisabled: boolean;
    $: scrimsAreDisabled = $scrimsDisabled.data?.getScrimsDisabled;

    function calculateActivityChange() {
        const prev = metrics.previousCompletedScrims ?? 0;
        const cur = metrics?.completedScrims ?? 0;

        const change = cur - prev;
        const ratio = change / Math.max(prev, 1);
        if (ratio === 0) {
            activityChange = "No change";
        } else {
            activityChange = `${Math.abs(Math.round(ratio * 100))}% ${ratio > 0 ? "up" : "down"}`;
        }
    }
    $: if (typeof metrics?.completedScrims === "number" || typeof metrics?.previousCompletedScrims === "number") {
        calculateActivityChange();
    }
</script>

<DashboardLayout>
    <DashboardCard class="col-span-6 xl:col-span-5 row-span-3">
        {#if $currentScrim.fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full"/>
            </div>
        {:else if $currentScrim.data?.currentScrim}
            <QueuedView/>
        {:else if scrimsAreDisabled}
            <DisabledView/>
        {:else}
            <AvailableScrimsView/>
        {/if}
    </DashboardCard>
    <DashboardNumberCard title="Scrims in the last hour"
                         value={metrics?.completedScrims ?? 0}
                         description="{activityChange}"
    />
    <DashboardNumberCard title="Pending Scrims"
                         value={metrics?.pendingScrims ?? 0}
    />
    <DashboardNumberCard title="Active Players"
                         value={metrics?.totalPlayers ?? 0}
    />

</DashboardLayout>
