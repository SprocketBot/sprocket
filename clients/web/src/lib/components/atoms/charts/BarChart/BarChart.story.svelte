<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import faker from "faker";

    import BarChart from "./BarChart.svelte";

    export let Hst: _Hst;

    let numCategories = 50

    let data: Record<string, number> = {};
    $: {
        data = {};
        for (let i = 0; i < numCategories; i++) {
            const key = faker.vehicle.manufacturer();
            const value = faker.datatype.number(50);
            data[key] = value;
        }
    }
</script>

<Hst.Story title="Charts/BarChart">
    <Hst.Variant title="Default">
        <div class="w-96 h-96">
            <BarChart data={data} />
        </div>
    </Hst.Variant>
</Hst.Story>
