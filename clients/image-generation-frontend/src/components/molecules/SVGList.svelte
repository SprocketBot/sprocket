<script lang="ts">
    import {previewEl} from "$src/stores";
    import ElementReference from "$components/molecules/ElementReference.svelte";

</script>

{#if $previewEl}
    <section>
        <header>
            <h3>Select an Element</h3>
        </header>
        <ElementReference ref={$previewEl} />
    </section>
{/if}

<style lang="postcss">
    section {
        @apply p-6 overflow-auto max-h-full select-none;
    }
    header {
        @apply mb-4;
    }
    h3 {
        @apply text-lg font-bold;
    }
</style>
