<script lang="ts" context="module">
    import type * as echarts from "echarts";
    let e: typeof echarts | undefined;
    async function getEcharts(): Promise<typeof echarts> {
        // Dynamically load echarts because ESM/CJS sucks
        if (!e) e = await import("echarts")
        return e
    }
</script>

<script lang="ts">
    import {onMount} from "svelte";
    import {theme} from "./theme";

    export let options: echarts.EChartsOption;

    let chart: echarts.ECharts | undefined;
    let container: HTMLElement | undefined;

    onMount(async () => {
        if (!container) throw new Error("Missing container element!");
        await getEcharts()
        chart = e.init(container, theme);
    });
    $: if (chart && options) chart.setOption(options);
</script>

<div bind:this={container} />

<style lang="postcss">
    div {
        @apply h-full w-full;
    }
</style>
