<script lang="ts">
    import FaLock from "svelte-icons/fa/FaLock.svelte";

    import type {MetricsResult} from "$lib/api";
    import {
        currentScrim,
        currentUser,
        scrimMetrics,
        scrimsDisabled,
    } from "$lib/api";
    import {
        AvailableScrimsView,
        DashboardCard,
        DashboardLayout,
        DashboardNumberCard,
        DisabledView,
        QueuedView,
        Spinner,
    } from "$lib/components";

    let metrics: MetricsResult["metrics"];
    $: metrics = $scrimMetrics.data?.metrics;
    let activityChange = "";

    let scrimsAreDisabled: boolean;
    $: scrimsAreDisabled = $scrimsDisabled.data?.getScrimsDisabled;

    let currentUserFranchises: string[] | undefined;
    $: currentUserFranchises = $currentUser.data?.me?.members?.flatMap(
        m => m.players.flatMap(p => p.franchiseName as string) as string[],
    );

    function calculateActivityChange(): void {
        const prev = metrics.previousCompletedScrims ?? 0;
        const cur = metrics?.completedScrims ?? 0;

        const change = cur - prev;
        const ratio = change / Math.max(prev, 1);
        if (ratio === 0) {
            activityChange = "No change";
        } else {
            activityChange = `${Math.abs(Math.round(ratio * 100))}% ${
                ratio > 0 ? "up" : "down"
            }`;
        }
    }
    $: if (
        typeof metrics?.completedScrims === "number" ||
        typeof metrics?.previousCompletedScrims === "number"
    ) {
        calculateActivityChange();
    }
</script>

<DashboardLayout>
    <DashboardCard class="col-span-6 xl:col-span-5 row-span-3">
        {#if $currentScrim.fetching || $currentUser.fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full" />
            </div>
        {:else if currentUserFranchises?.includes("FP")}
            <section
                class="flex flex-col justify-center items-center h-full gap-4"
            >
                <span class="h-32 text-sprocket block"><FaLock /></span>
                <span class="text-7xl font-bold text-primary"
                    >Former Players Cannot Scrim</span
                >
            </section>
        {:else if $currentScrim.data?.currentScrim}
            <QueuedView />
        {:else if scrimsAreDisabled}
            <DisabledView />
        {:else}
            <AvailableScrimsView />
        {/if}
    </DashboardCard>
    <DashboardNumberCard
        title="Scrims in the last hour"
        value={metrics?.completedScrims ?? 0}
        description={activityChange}
    />
    <DashboardNumberCard
        title="Pending Scrims"
        value={metrics?.pendingScrims ?? 0}
    />
    <DashboardNumberCard
        title="Active Players"
        value={metrics?.totalPlayers ?? 0}
    />
</DashboardLayout>
