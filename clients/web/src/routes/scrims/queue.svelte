<script lang="ts">
    import {currentScrim} from "$lib/api";
    import type {MetricsResult} from "$lib/api/queries/ScrimMetrics.store";
    import {scrimMetrics} from "$lib/api/queries/ScrimMetrics.store";

    import {
        BigNumber,
        DashboardLayout,
        AvailableScrimsView,
        QueuedView,
        StatGroup,
    } from "$lib/components";

    import DebugPlayerStoreForm from "$lib/components/__debug__/DebugPlayerStoreForm.svelte";

    let metrics: MetricsResult["metrics"];
    $: metrics = $scrimMetrics.data?.metrics;

    let activityChange: number = 0;

    function calculateActivityChange() {
        const prev = metrics.previousCompletedScrims;
        const cur = metrics?.completedScrims;
        if (metrics?.completedScrims && metrics.previousCompletedScrims) {
            const change =  cur - prev;
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
    <div class="row">
        <StatGroup responsive>
            <BigNumber num={metrics?.completedScrims ?? 0} label="Scrims in the last hour" description="{Math.abs(activityChange)}% {activityChange > 0 ? 'more' : 'less'} than previous hour"/>
            <BigNumber num={metrics?.pendingScrims ?? 0} label="Pending Scrims"/>
            <BigNumber num={metrics?.totalPlayers ?? 0} label="Active Players">
            </BigNumber>
        </StatGroup>
    </div>

    {#if $currentScrim.fetching}
        Loading...
    {:else if $currentScrim.data?.currentScrim}
        <QueuedView/>
    {:else}
        <AvailableScrimsView/>
    {/if}
</DashboardLayout>

<style lang="postcss">
    .row {
        @apply flex gap-4 w-full mb-8;

        & :global(> *) {
            @apply flex-1;
        }

        img {
            @apply w-full mb-2;
        }

        span {
            @apply text-xl;
        }
    }

    h2 {
        @apply text-4xl mb-8;
    }
</style>
