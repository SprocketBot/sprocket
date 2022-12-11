import type {Writable} from "svelte/store";

export const BarChartContextKey = "BAR_CHART_CONTEXT_KEY";
export type IBar = {
    label: string;
    value: number;
};
export type BarChartContext = {
    /**
     * @param bar
     * @returns Function to remove bar from the graph
     */
    addBar: (bar: IBar) => () => void;
};
