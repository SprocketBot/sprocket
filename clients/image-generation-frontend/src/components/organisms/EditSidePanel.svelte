<style lang="postcss">
    div {
        @apply h-full max-w-full;
    }
</style>

<script lang="ts">
    import {selectedEl, imageType} from "$src/stores";

    import DataItems from "$components/molecules/DataItems.svelte";
    import {blur, fly} from "svelte/transition";
    import {absoluteWhileTransitioning} from "$utils/absoluteWhileTransitioning";
    import SvgList from "$components/molecules/SVGList.svelte";
    import {onMount} from "svelte";
    import type {ImageType} from "$src/types";

    export let imTy: ImageType;

    onMount(() => {
        $imageType = imTy;
    });
</script>

{#if $selectedEl}
    <div out:blur|local={{}} in:fly={{y: 50}} use:absoluteWhileTransitioning>
        <DataItems />
    </div>
{:else}
    <div out:blur|local={{}} in:fly={{y: 50}} use:absoluteWhileTransitioning>
        <SvgList />
    </div>
{/if}
