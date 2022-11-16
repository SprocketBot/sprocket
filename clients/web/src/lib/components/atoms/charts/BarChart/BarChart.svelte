<script lang="ts">
    import type {
        EChartsOption, XAXisComponentOption, YAXisComponentOption,
} from "echarts";
    import BaseChart from "../BaseChart.svelte";
    export let data: Record<string, number> = {};
    export let horizontal: boolean = false;
    export let showTooltip: boolean = true;
    export let title: string = "";

    const categoryOptions = {
        type: "category",
        data: Object.keys(data),
    };
    const valueOptions = {
        type: "value",
    };

    const options: EChartsOption = {
        xAxis: (horizontal ? valueOptions : categoryOptions) as XAXisComponentOption,
        yAxis: (horizontal ? categoryOptions : valueOptions) as YAXisComponentOption,
        series: {
            data: Object.values(data),
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

<BaseChart {options} />
