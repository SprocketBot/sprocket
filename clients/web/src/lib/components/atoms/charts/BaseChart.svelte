<script lang="ts">
    import * as echarts from "echarts";
    import {onMount} from "svelte";
    import {theme} from "./theme";
    export let options: echarts.EChartsOption;
    let chart: echarts.ECharts | undefined;
    let container: HTMLElement | undefined;

    onMount(() => {
        if (!container) throw new Error("Missing container element!");
        chart = echarts.init(container, theme);
    });
    $: if (chart && options) chart.setOption(options);
</script>

<div bind:this={container} />

<style lang="postcss">
    div {
        @apply h-full w-full;
    }
</style>
