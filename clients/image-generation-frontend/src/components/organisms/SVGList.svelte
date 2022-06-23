<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import ElementReference from "../molecules/ElementReference.svelte";

    const previewEl = getContext<Writable<any>>("previewEl");
</script>

{#if $previewEl}
<section>
    <ElementReference ref={$previewEl} />
</section>
{/if}


<style lang="postcss"> 
    section {
        @apply p-6 overflow-auto max-h-full;
    }
</style>