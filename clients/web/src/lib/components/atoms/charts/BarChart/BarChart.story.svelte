<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import BarChart from "./BarChart.svelte";
    import type {IBars} from "./types";
    import times from "lodash.times";
    import {faker} from "@faker-js/faker";

    export let Hst: _Hst;

    let categories = 5;

    let bars: IBars = {};
    const cats = times(categories, () => faker.hacker.noun());
    $: bars = {
        Zach: {
            Shots: faker.datatype.number(5),
            Goals: faker.datatype.number(2),
            MVPR: faker.datatype.number(10),
            "Sprocket Rating": faker.datatype.number(100),
        },
        Shuckle: {
            Shots: faker.datatype.number(5),
            Goals: faker.datatype.number(2),
            MVPR: faker.datatype.number(10),
            "Sprocket Rating": faker.datatype.number(100),
        },
        Nigel: {
            Shots: faker.datatype.number(5),
            Goals: faker.datatype.number(2),
            MVPR: faker.datatype.number(10),
            "Sprocket Rating": faker.datatype.number(100),
        },
        Hyper: {
            Shots: faker.datatype.number(5),
            Goals: faker.datatype.number(2),
            MVPR: faker.datatype.number(10),
            "Sprocket Rating": faker.datatype.number(100),
        },
    };
</script>

<Hst.Story title="Atoms/Charts/BarChart" layout={{type: "grid", width: 800}}>
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
            <BarChart categoryLabel="Manufacturer" valueLabel="Some Made up Stat" {bars} />
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
