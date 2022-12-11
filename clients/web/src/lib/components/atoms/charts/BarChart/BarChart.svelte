<script lang="ts">
    import type {BarSeriesOption, EChartsOption, XAXisComponentOption, YAXisComponentOption} from "echarts";

    import BaseChart from "../BaseChart.svelte";
    import type {IBars} from "./types";
    export let horizontal = false;
    export let showTooltip = true;
    export let categoryLabel: string;
    export let valueLabel: string;

    export let bars: IBars;

    let categories: string[];
    let seriesNames: string[];
    let series: Record<string, number[]>;

    $: if (bars) {
        categories = Object.keys(bars);
        seriesNames = Array.from(new Set(Object.values(bars).flatMap(Object.keys)));
        series = seriesNames.reduce<Record<string, number[]>>((a, seriesName: string) => {
            if (!a[seriesName]) a[seriesName] = Object.values(bars).map(datum => datum[seriesName]);
            return a;
        }, {});
    }

    let categoryOptions: XAXisComponentOption | YAXisComponentOption;

    $: categoryOptions = {
        type: "category",
        name: categoryLabel,
        data: categories,
    };

    let valueOptions: XAXisComponentOption | YAXisComponentOption = {
        type: "value",
        name: valueLabel,
    };

    let options: EChartsOption;
    $: options = {
        xAxis: (horizontal ? valueOptions : categoryOptions) as XAXisComponentOption,
        yAxis: (horizontal ? categoryOptions : valueOptions) as YAXisComponentOption,
        // series: bars.map((b): BarSeriesOption => ({
        //     data: b.values,
        //     type: "bar",
        //     colorBy: "series",
        //     name: b.label
        // })),
        series: Object.entries(series).map(([k, v]) => ({
            name: k,
            data: v,
            type: "bar",
        })),
        legend: {},
        tooltip: {
            show: showTooltip,
            trigger: "axis",
        },
    };
</script>

<BaseChart {options} />
