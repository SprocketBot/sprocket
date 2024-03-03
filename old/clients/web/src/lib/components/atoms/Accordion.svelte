<script lang="ts">
    import {setContext} from "svelte";
    import {slide} from "svelte/transition";

    export let title: string | undefined = undefined;
    export let expanded: boolean = true;

    const toggleExpanded = (): void => { expanded = !expanded };
    const close = (): void => { expanded = false };

    setContext("close", close);
</script>


<div class="accordion">
    <div class="title" on:click={toggleExpanded}>
        {#if title}
            {title}
        {:else}
            <slot name="title" />
        {/if}
    </div>
    {#if expanded}
        <div transition:slide>
            <slot {close} />
        </div>
    {/if}
</div>


<style lang="postcss">
    .accordion {
        @apply w-full;
    }

    .title {
        @apply w-full cursor-pointer;
    }
</style>