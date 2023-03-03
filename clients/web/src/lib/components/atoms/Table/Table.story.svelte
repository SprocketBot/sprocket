<script lang="ts">
    import type {Hst as _Hst} from "@histoire/plugin-svelte";
    import {faker} from "@faker-js/faker";
    import {createColumnHelper, type ColumnDef} from "@tanstack/svelte-table";
    import times from "lodash.times";

    import Table from "./Table.svelte";

    export let Hst: _Hst;

    interface Player {
        active: boolean;
        id: number;
        league: string;
        name: string;
        salary: number;
        team: string;
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
        columnHelper.accessor("id", {
            header: 'ID',
            enableSorting: false,
        }),
        columnHelper.accessor("name", {
            header: "Name",
            enableSorting: true,
        }),
        columnHelper.accessor("team", {
            header: "Team",
        }),
        columnHelper.accessor("league", {
            header: "League",
        }),
        columnHelper.accessor("salary", {
            header: "Salary"
        }),
        columnHelper.accessor("active", {
            header: "Active"
        }),
    ];
</script>

<Hst.Story title="Atoms/Table" layout={{type: "single"}}>
    <svelte:fragment slot="controls" />

    <Hst.Variant title="Basic">
        <div class="m-4">
            <Table {data} {columns} />
        </div>
    </Hst.Variant>
</Hst.Story>
