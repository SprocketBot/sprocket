<script lang="ts">
    import Controls from "../organisms/Controls.svelte";
    import Preview from "../organisms/Preview.svelte";
import SvgList from "../organisms/SVGList.svelte";
import TemplateItems from "../organisms/TemplateItems.svelte";
</script>

<main>
    <section class="preview">
        <slot name="preview">
            <Preview source="/img/techdemo_figma.svg"/>
        </slot>
    </section>
    <section class="controls">
        
    </section>
    <aside class="previewEls">
        <slot name="previewEls">
            <SvgList/>
        </slot>
    </aside>
    <aside class="fields">
        <slot name="fields">
            <TemplateItems templateName="Star of the Week"/>
        </slot>
    </aside>
</main>

<style lang="postcss">
    main {
        @apply h-screen max-h-screen w-screen
               grid grid-cols-6 grid-rows-6;

        

        /* grid-template-columns: auto 30rem;
        grid-template-rows: auto 30rem;
        grid-template-areas: 
            "preview els"
            "controls fields"; */
    }
    main * {
        @apply h-full max-h-full min-h-full 
               w-full max-w-full min-w-full;
    }
    .preview {
        @apply bg-gray-50 col-start-1 
                col-span-4 row-start-1 row-span-4;
        /* grid-area: preview; */
    }
    .controls {
        @apply bg-gray-200 border-t-2 border-gray-800
                col-span-4 col-start-1 row-start-5 row-span-2;
        /* grid-area: controls; */
    }
    .previewEls {
        @apply bg-gray-200 border-l-2 border-gray-800
                col-span-2 col-start-5 row-start-1 row-span-3;
        /* grid-area: els; */
    }
    .fields {
        @apply bg-gray-200 border-l-2 border-t-2 border-gray-800
                col-span-2 col-start-5 row-start-4 row-span-3;
        /* grid-area: fields; */
    }

</style>