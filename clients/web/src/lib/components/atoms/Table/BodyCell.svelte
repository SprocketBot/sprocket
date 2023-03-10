<script lang="ts">
    import { flexRender, type Cell } from "@tanstack/svelte-table";

    export let cell: Cell<any, unknown>;

    $: content = flexRender(cell.column.columnDef.cell, cell.getContext());
</script>


<td class="bg-gray-800 p-4 text-sm font-normal text-gray-50">
    <svelte:component this={content} />
</td>
