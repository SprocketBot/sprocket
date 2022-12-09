<script lang="ts">
    import {clickOutside} from "$lib/actions/clickOutside.action";
    import {slide} from "svelte/transition";
    let open: boolean = false;

    export let transparent: boolean = false;
</script>

<div class="relative" use:clickOutside={{callback: () => (open = false)}}>
    <button type="button" class:transparent on:click={() => (open = !open)}> <slot name="handle">Handle</slot> </button>

    {#if open}
        <div class="z-10 w-44 rounded divide-y divide-gray-100 shadow bg-gray-600 absolute top-[110%]" transition:slide>
            <slot />
        </div>
    {/if}
</div>

<style lang="postcss">
    button {
        @apply text-white focus:ring-2 focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center 
                bg-info-600 hover:bg-info-700 focus:ring-info-500;

        &.transparent {
            @apply bg-transparent hover:bg-transparent p-0;
        }
    }
</style>
