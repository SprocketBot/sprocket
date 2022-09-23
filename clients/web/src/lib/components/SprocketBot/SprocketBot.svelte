<script lang="ts">
    import Eye from "./Eye.svelte";

    let clazz: string = "";
    export {clazz as class};
</script>

<figure class={clazz}>
    <img src="/sprocketbot_yellow.png" alt="" />
    
    <Eye class="absolute w-[22%] h-[22%] top-[35.5%] left-[34.75%]" side="left" />
    <Eye class="absolute w-[22%] h-[22%] top-[35.5%] right-[34.3%]" side="right" />
</figure>

<style lang="postcss">
    figure {
        @apply relative w-fit;
    }

    img {
        @apply h-full;
    }
</style>
