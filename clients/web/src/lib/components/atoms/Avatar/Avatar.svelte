<script lang="ts" context="module">
    export type ShapeVariant = "rounded" | "square" | "circle";
    export type SizeVariant =  "sm" | "rg" | "md" | "lg" | "xl";
</script>

<script lang="ts">
    export let shape: ShapeVariant = "circle";
    export let size: SizeVariant = "rg";
    export let url: string | undefined = undefined;
</script>

{#if url===undefined}
    <div class="overflow-hidden relative w-10 h-10 bg-gray-100 rounded-full dark:bg-gray-600">
       <svg class="absolute -left-1 w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
    </div>
{:else}
    <img class="w-10 h-10 rounded-full" src={url}/>
{/if}









