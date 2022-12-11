<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import BarChart from "./BarChart.svelte";
    import Bar from "./Bar.svelte";
    import type {IBar} from "./types";

    import {faker} from "@faker-js/faker";

    export let Hst: _Hst;

    let categories = 5;
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
            <BarChart title="Random Car Stats" categoryLabel="Manufacturer" valueLabel="Some Made up Stat">
                {#each new Array(categories)
                    .fill(null)
                    .map(() => ({label: faker.vehicle.manufacturer(), value: faker.datatype.number(100)})) as bar}
                    <Bar {...bar} />
                {/each}
            </BarChart>
        </div>
    </Hst.Variant>
</Hst.Story>
