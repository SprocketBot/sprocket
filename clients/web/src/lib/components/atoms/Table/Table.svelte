<script lang="ts" context="module">
    export type ColumnDefs<T extends unknown> = ColumnDef<T, T[keyof T]>[];
</script>

<script lang="ts">
    import { createSvelteTable, getCoreRowModel, flexRender, type TableOptions, type ColumnDef } from "@tanstack/svelte-table";
    
    type T = $$Generic<unknown>;

    interface $$Props {
        data: T[],
        columns: ColumnDef<T, any>[],
    }

    export let data: T[];
    export let columns: ColumnDef<T, any>[];

    const options: TableOptions<T> = {
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    }
    
    const table = createSvelteTable(options)
</script>


<table>
    <thead>
        {#each $table.getHeaderGroups() as headerGroup}
            <tr>
                {#each headerGroup.headers as header}
                    <th>
                        {#if !header.isPlaceholder}
                            <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
                        {/if}
                    </th>
                {/each}
            </tr>
        {/each}
        </thead>

        <tbody>
            {#each $table.getRowModel().rows as row}
                <tr>
                    {#each row.getVisibleCells() as cell}
                        <td>
                            <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>

        <tfoot>
            {#each $table.getFooterGroups() as footerGroup}
                <tr>
                    {#each footerGroup.headers as header}
                        <th>
                            {#if !header.isPlaceholder}
                                <svelte:component this={flexRender(header.column.columnDef.footer, header.getContext())} />
                            {/if}
                        </th>
                    {/each}
                </tr>
            {/each}
        </tfoot>
</table>


<style lang="postcss">
    table {
        color: white;
    }
</style>