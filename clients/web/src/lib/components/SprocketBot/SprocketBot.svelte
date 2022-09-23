<script lang="ts">
    import Eye from "./Eye.svelte";
</script>

<figure>
    <img src="/sprocketbot_yellow.png" alt="" />
    
    <Eye class="absolute w-[22%] h-[22%] top-[35.5%] left-[34.75%]" side="left" />
    <Eye class="absolute w-[22%] h-[22%] top-[35.5%] right-[34.3%]" side="right" />
</figure>

<style lang="postcss">
    figure {
        @apply relative h-full;
    }

    img {
        @apply h-full;
    }
</style>
