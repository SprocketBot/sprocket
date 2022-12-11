<script lang="ts">
    import type {EChartsOption, XAXisComponentOption, YAXisComponentOption} from "echarts";

    import {writable} from "svelte/store";
    import {setContext} from "svelte";
    import BaseChart from "../BaseChart.svelte";
    import {type IBar, type BarChartContext, BarChartContextKey} from "./types";
    export let horizontal = false;
    export let showTooltip = true;
    export let title = "";
    export let categoryLabel: string;
    export let valueLabel: string;

    let bars = writable<IBar[]>([]);
    function addBar(input: IBar) {
        $bars = [...$bars, input];
        return () => ($bars = $bars.filter(b => b !== input));
    }
    setContext<BarChartContext>(BarChartContextKey, {addBar});

    let categoryOptions: XAXisComponentOption | YAXisComponentOption;

    $: categoryOptions = {
        type: "category",
        name: categoryLabel,
        data: $bars.map(b => b.label),
    };

    let valueOptions: XAXisComponentOption | YAXisComponentOption = {
        type: "value",
        name: valueLabel,
    };

    let options: EChartsOption;
    $: options = {
        xAxis: (horizontal ? valueOptions : categoryOptions) as XAXisComponentOption,
        yAxis: (horizontal ? categoryOptions : valueOptions) as YAXisComponentOption,
        series: {
            data: $bars.map(b => b.value),
            type: "bar",
        },
        tooltip: {
            show: showTooltip,
            trigger: "axis",
        },
        title: {
            text: title,
        },
    };
</script>

<slot />
<BaseChart {options} />
