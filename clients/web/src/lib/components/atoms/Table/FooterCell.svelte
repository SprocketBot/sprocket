<script lang="ts">
    import { flexRender , type Header } from "@tanstack/svelte-table";

    export let footer: Header<any, unknown>;
    export let colspan: number = 1;

    $: content = flexRender(footer.column.columnDef.header, footer.getContext());
</script>


<th class="p-0 h-1 bg-gray-600" {colspan}>
    {#if !footer.isPlaceholder}
        <div class="w-full h-full flex items-center justify-center gap-2 p-4 text-sm font-bold text-white">
            <svelte:component this={content} />
        </div>
    {/if}
</th>
