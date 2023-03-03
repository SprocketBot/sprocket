<script lang="ts">
    import { flexRender , type Header } from "@tanstack/svelte-table";

    import { hoverable } from "$lib/actions";

    import { SortingIcon } from "../SortingIcon";

    export let header: Header<any, unknown>;
    export let colspan: number = 1;

    const sortable = header.column.getCanSort();
    const onSort = header.column.getToggleSortingHandler();

    const content = flexRender(header.column.columnDef.header, header.getContext());

    let hovered: boolean = false;
</script>


<th class="p-0 h-1 bg-gray-600 border-b border-gray-600" {colspan}>
    {#if !header.isPlaceholder}
        <div
            on:click={onSort}
            on:keypress={onSort}
            class="w-full h-full flex items-center justify-center gap-2 p-4 text-sm font-bold text-white uppercase {sortable && 'cursor-pointer'}"
            use:hoverable={{ onHoverChange: v => hovered = v }}
        >
            <svelte:component this={content} />

            {#if sortable}
                <SortingIcon direction={header.column.getIsSorted()} {hovered} />
            {/if}
        </div>
    {/if}
</th>
