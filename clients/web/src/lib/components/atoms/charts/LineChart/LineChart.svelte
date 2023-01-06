<script lang="ts">
    import type {
        EChartsOption,
        LabelFormatterCallback,
        LineSeriesOption,
        SeriesOption,
        XAXisComponentOption,
        YAXisComponentOption,
    } from "echarts";

    import BaseChart from "../BaseChart.svelte";
    import type {ILine} from "./types";
    export let showTooltip = true;
    export let xAxisLabel: string;
    export let yAxisLabel: string;
    export let labelFormatter: LabelFormatterCallback | undefined;

    export let lines: ILine[];

    let yAxisOptions: YAXisComponentOption = {
        type: "value",
        name: yAxisLabel,
    };

    let xAxisOptions: XAXisComponentOption = {
        name: xAxisLabel,
        data: Array.from(new Set(lines.flatMap(b => b.points.map(b => b.x)))),
    };

    let options: EChartsOption;
    $: options = {
        xAxis: xAxisOptions,
        yAxis: yAxisOptions,
        series: lines.map(
            (l): LineSeriesOption => ({
                data: l.points.map(p => p.y),
                type: "line",
                colorBy: "series",
                name: l.label,
                label: {
                    formatter: labelFormatter,
                },
            }),
        ),
        legend: {
            data: lines.map(l => l.label),
        },
        tooltip: {
            show: showTooltip,
            trigger: "axis",
        },
    };
</script>

<BaseChart {options} />
