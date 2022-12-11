<script lang="ts">
    import {getContext, onDestroy} from "svelte";
    import {BarChartContextKey, type BarChartContext} from "./types";

    export let label: string;
    export let value: number;
    const {addBar} = getContext<BarChartContext>(BarChartContextKey);

    onDestroy(addBar({label, value}));
</script>
