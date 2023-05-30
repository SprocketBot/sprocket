<script lang="ts">
    import {writable} from "svelte/store";
    import {
        flexRender,
        createSvelteTable,
        getCoreRowModel,
        getSortedRowModel,
        type TableOptions,
        type ColumnDef,
        type SortingState,
        type Updater,
    } from "@tanstack/svelte-table";

    import HeaderCell from "./HeaderCell.svelte";
    import BodyCell from "./BodyCell.svelte";
    import FooterCell from "./FooterCell.svelte";

    type T = $$Generic<unknown>;

    interface $$Props {
        data: T[];
        columns: ColumnDef<T, any>[];
    }

    export let data: T[];
    export let columns: ColumnDef<T, any>[];

    let sorting: SortingState = [];

    const onSortingChange = (updaterOrValue: Updater<SortingState>) => {
        if (typeof updaterOrValue === "function") {
            sorting = updaterOrValue(sorting);
        } else {
            sorting = updaterOrValue;
        }
        options.update(old => ({
            ...old,
            state: {
                ...old.state,
                sorting,
            },
        }));
    };

    const options = writable<TableOptions<T>>({
        data,
        columns,
        state: {sorting},
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const table = createSvelteTable(options);

    $: hasHeader = columns.some(column => Boolean(column.header));
    $: hasBody = data.length > 0;
    $: hasFooter = columns.some(column => Boolean(column.footer));
</script>

<table>
    {#if hasHeader}
        <thead>
            {#each $table.getHeaderGroups() as headerGroup}
                <tr>
                    {#each headerGroup.headers as header}
                        <HeaderCell {header} colspan={header.colSpan} />
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
                        <BodyCell {cell} />
                    {/each}
                </tr>
            {/each}
        </tbody>
    {/if}

    {#if hasFooter}
        <tfoot>
            {#each $table.getFooterGroups() as footerGroup}
                <tr>
                    {#each footerGroup.headers as footer}
                        <FooterCell {footer} />
                    {/each}
                </tr>
            {/each}
        </tfoot>
    {/if}
</table>

<style lang="postcss">
    table {
        /* Need this in order to round the border at corners */
        @apply border-separate border-spacing-0;

        /* All cells have a border bottom */
        :global(th),
        :global(td) {
            @apply border-gray-600 border-b;
        }

        /* Round 4 corners of table */
        *:first-child tr:first-child {
            :global(th:first-child),
            :global(td:first-child) {
                @apply rounded-tl-lg;
            }
            :global(th:last-child),
            :global(td:last-child) {
                @apply rounded-tr-lg;
            }
        }

        *:last-child tr:last-child {
            :global(th:first-child),
            :global(td:first-child) {
                @apply rounded-bl-lg;
            }
            :global(th:last-child),
            :global(td:last-child) {
                @apply rounded-br-lg;
            }
        }

        /* Outside border on first and last cell in row */
        :global(th:first-child),
        :global(td:first-child) {
            @apply border-l;
        }
        :global(th:last-child),
        :global(td:last-child) {
            @apply border-r;
        }
    }
</style>
