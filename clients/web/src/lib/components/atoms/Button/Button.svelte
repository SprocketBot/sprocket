<script lang="ts">
    export let type:string = "primary";
</script>

{#if type === "secondary"}
<button type="button" class="text-white bg-secondary-700 hover:bg-primary-800 
focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm 
px-5 py-2.5 mr-2 mb-2 focus:outline-none" on:click>
    <slot />
</button>
{:else}
<button type="button" class="text-white bg-primary-700 hover:bg-secondary-800 
focus:ring-4 focus:ring-secondary-300 font-medium rounded-lg text-sm 
px-5 py-2.5 mr-2 mb-2 focus:outline-none" on:click>
    <slot />
</button>
{/if}

