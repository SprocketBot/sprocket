<script lang="ts">
    import {slide} from "svelte/transition";
    import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
    import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";

    export let title: string;
    export let open = false;
</script>

<div class="bg-base-300/20 px-4 py-4 rounded-lg space-y-4">
    <div
        class="flex justify-between items-center cursor-pointer select-none"
        on:click={() => {
            open = !open;
        }}
    >
        <span class="text-xl font-bold">{title}</span>
        <span class="h-6">
            {#if open} <FaChevronDown /> {:else} <FaChevronUp /> {/if}
        </span>
    </div>
    {#if open}
        <div transition:slide>
            <slot />
        </div>
    {/if}
</div>
