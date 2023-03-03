<script lang="ts">
    import { writable } from "svelte/store";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { ArrowUp, ArrowDown } from "@steeze-ui/heroicons";
    import { createSvelteTable, getCoreRowModel, getSortedRowModel, flexRender, type TableOptions, type ColumnDef, type SortingState, type Updater } from "@tanstack/svelte-table";
    
    type T = $$Generic<unknown>;

    interface $$Props {
        data: T[],
        columns: ColumnDef<T, any>[],
    }

    export let data: T[];
    export let columns: ColumnDef<T, any>[];

    let sorting: SortingState = [];

    const onSortingChange = (updaterOrValue: Updater<SortingState>) => {
        if (typeof updaterOrValue === 'function') {
            sorting = updaterOrValue(sorting)
        } else {
            sorting = updaterOrValue
        }
        options.update(old => ({
            ...old,
            state: {
                ...old.state,
                sorting,
            },
        }));
    }

    const options = writable<TableOptions<T>>({
        data,
        columns,
        state: { sorting },
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    
    const table = createSvelteTable(options)

    $: hasHeader = columns.some(column => Boolean(column.header));
    $: hasBody = data.length > 0;
    $: hasFooter = columns.some(column => Boolean(column.footer));
</script>


<!-- TODO refactor into separate components! HeaderCell, BodyCell, Row, etc -->

<table>
    {#if hasHeader}
        <thead>
            {#each $table.getHeaderGroups() as headerGroup}
                <tr>
                    {#each headerGroup.headers as header}
                        {@const sortable = header.column.getCanSort()}
                        {@const filterable = header.column.getCanFilter()}
                        {@const onSort = header.column.getToggleSortingHandler()}

                        <th class:sortable class:filterable on:click={onSort} on:keypress={onSort}>
                            {#if !header.isPlaceholder}
                                <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />

                                {#if sortable}
                                    {@const direction = header.column.getIsSorted()}

                                    {#if direction === 'asc'}
                                        <Icon src={ArrowUp} size="8px" />
                                    {:else if direction === 'desc'}
                                        <Icon src={ArrowDown} size="8px" />
                                    {:else}
                                        <Icon src={ArrowUp} size="8px" />
                                        <Icon src={ArrowDown} size="8px" />
                                    {/if}
                                {/if}
                            {/if}
                        </th>
                    {/each}
                </tr>
            {/each}
        </thead>
    {/if}

    {#if hasBody}
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
    {/if}

    {#if hasFooter}
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
    {/if}
</table>


<style lang="postcss">
    thead th {
        @apply p-4 bg-gray-600 border-b border-gray-600 text-sm font-bold text-white uppercase;

        &.sortable {
            @apply cursor-pointer select-none;
        }
    }

    tbody td {
        @apply p-4 bg-gray-800 border-b border-gray-600 text-sm font-normal text-gray-50;
    }

    tfoot th {
        @apply p-4 bg-gray-600 text-sm border-b border-gray-600 text-white font-bold;
    }

    table {
        /* Round corners */
        *:first-child tr:first-child {
            th:first-child, td:first-child {
                @apply rounded-tl-lg;
            }
            th:last-child, td:last-child {
                @apply rounded-tr-lg;
            }
        }

        *:last-child tr:last-child {
            th:first-child, td:first-child {
                @apply rounded-bl-lg;
            }
            th:last-child, td:last-child {
                @apply rounded-br-lg;
            }
        }

        *:last-child tr:last-child {
            th, td {
                @apply border-0;
            }
        }
    }

</style>