<script lang="ts">
    import type {ECharts, EChartsOption} from "echarts";
    import {onMount} from "svelte";
    import {theme} from "./theme";

    export let options: EChartsOption;

    let chart: ECharts | undefined;
    let container: HTMLElement | undefined;

    onMount(async () => {
        // Importing normally causes TS module errors
        const echarts = await import('echarts')

        if (!container) return;
        chart = echarts.init(container, theme);
    });

    $: if (chart) chart.setOption(options);
</script>

<div bind:this={container} />

<style lang="postcss">
    div {
        @apply h-full w-full;
    }
</style>
