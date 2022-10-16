<script lang="ts">
    import {
        currentUser, currentScrim, scrimsDisabled, scrimMetrics,
    } from "$lib/api";
    import type {MetricsResult} from "$lib/api";
    import {format, utcToZonedTime} from "date-fns-tz";

    import {
        AvailableScrimsView,
        DashboardLayout,
        DashboardCard,
        DashboardNumberCard,
        QueuedView,
        DisabledView,
        Spinner,
    } from "$lib/components";
    import FaLock from "svelte-icons/fa/FaLock.svelte";

    let metrics: MetricsResult["metrics"];
    $: metrics = $scrimMetrics.data?.metrics;
    let activityChange: string = "";

    let scrimsAreDisabled: boolean;
    $: scrimsAreDisabled = $scrimsDisabled.data?.getScrimsDisabled;

    let currentUserFranchises: string[] | undefined;
    $: currentUserFranchises = $currentUser.data?.me?.members?.flatMap(m => m.players.flatMap(p => p.franchiseName as string) as string[]);

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
        {#if $currentScrim.fetching || $currentUser.fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full"/>
            </div>
        {:else if currentUserFranchises?.includes("FP")}
            <section class="flex flex-col justify-center items-center h-full gap-4">
                <span class="h-32 text-sprocket block"><FaLock/></span>
                <span class="text-7xl font-bold text-primary">Former Players Cannot Scrim</span>
            </section>
        {:else if $currentScrim.data?.currentScrim}
            <QueuedView/>
        {:else if $currentUser.data?.me?.members?.some(m => m.restrictions.length)}
            <section class="flex flex-col justify-center items-center h-full gap-4">
                <span class="h-32 text-sprocket block"><FaLock/></span>
                <span class="text-7xl font-bold text-primary">You are Queue Banned</span>
                <span class="text-1xl">Expires {format(utcToZonedTime(new Date($currentUser.data?.me?.members?.find(m => m.restrictions.length).restrictions[0].expiration), "America/New_York"), "MMMM do, u 'at' h:mmaaa 'ET")}</span>
            </section>
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
