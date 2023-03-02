<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {faker} from "@faker-js/faker";
    import {createColumnHelper, type ColumnDef} from "@tanstack/svelte-table";
    import times from "lodash.times";

    import Table from "./Table.svelte";

    export let Hst: _Hst;

    interface Player {
        id: number;
        name: string;
        team: string;
        league: string;
        salary: number;
        active: boolean;
    }

    const randomPlayer = (): Player => ({
        id: faker.datatype.number({ min: 1, max: 20000 }),
        name: faker.internet.userName(),
        team: faker.helpers.arrayElement(["Pandas", "Sharks", "Flames", "Shadow"])!,
        league: faker.helpers.arrayElement(["FL", "AL", "CL", "ML", "PL"]),
        salary: faker.datatype.number({ max: 20 }) + Math.round(Math.random()) * 0.5,
        active: faker.datatype.boolean(),
    })

    const data = times(10, randomPlayer);

    const columnHelper = createColumnHelper<Player>();

    const columns = [
        columnHelper.accessor("id", {}),
        columnHelper.accessor("name", {}),
        columnHelper.accessor("team", {}),
        columnHelper.accessor("league", {}),
        columnHelper.accessor("salary", {}),
        columnHelper.accessor("active", {}),
    ];
</script>

<Hst.Story title="Atoms/Table" layout={{type: "single"}}>
    <svelte:fragment slot="controls" />

    <Hst.Variant title="Basic">
        <Table {data} {columns} />
    </Hst.Variant>
</Hst.Story>
