<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import LineChart from "./LineChart.svelte";
    import type {ILine} from "./types";
    import times from "lodash.times";

    import {faker} from "@faker-js/faker";

    export let Hst: _Hst;

    let categories = 5;

    let lines: ILine[] = [];

    $: lines = times(categories, () => ({
        label: faker.vehicle.manufacturer(),
        points: times(5, i => ({y: faker.datatype.number(), x: i})),
    }));
</script>

<Hst.Story title="Atoms/Charts/LineChart" layout={{type: "grid", width: 800}}>
    <svelte:fragment slot="controls">
        <div class="p-8 ">
            <label class="bg-gray-800 px-4 py-1 rounded-lg text-gray-100 flex gap-4 max-w-xs">
                <span> Bar Count </span>
                <input class="bg-gray-800 flex-1 h-full" bind:value={categories} type="number" />
            </label>
        </div>
    </svelte:fragment>
    <Hst.Variant title="Default">
        <div class="h-96">
            <LineChart yAxisLabel="Manufacturer" xAxisLabel="Some Made up Stat" {lines} />
        </div>
    </Hst.Variant>
</Hst.Story>

<!--
query {
    scrimStats {
        label: league
        value: scrimsInLastHour
    }
}
-->
