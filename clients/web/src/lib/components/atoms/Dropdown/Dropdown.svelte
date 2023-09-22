<script lang="ts">
    import {clickOutside} from "$lib/actions/clickOutside.action";
    import {slide} from "svelte/transition";
    let open = false;

    export let transparent = false;
    export let anchor: undefined | "right" | "left" = undefined;
</script>

<div class="relative flex justify-center items-center" use:clickOutside={{callback: () => (open = false)}}>
    <button type="button" class:transparent on:click={() => (open = !open)}> <slot name="handle">Handle</slot> </button>

    {#if open}
        <div
            class="z-10 w-44 rounded divide-y divide-gray-100 shadow absolute top-[110%]"
            class:right-0={anchor === "right"}
            class:left-0={anchor === "left"}
            class:bg-gray-600={!transparent}
            transition:slide
        >
            <slot />
        </div>
    {/if}
</div>

<style lang="postcss">
    button {
        @apply text-white focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center 
                bg-info-600 hover:bg-info-700 focus:ring-info-500 h-full;

        &.transparent {
            @apply bg-transparent hover:bg-transparent p-0;
        }
    }
</style>
