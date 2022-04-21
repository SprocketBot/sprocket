<script lang="ts">
    export let src: string = "/img/default_profile.png";
    export let alt: string = "Your Profile Picture";

    // Slight hack to expose a prop as "class"
    // Just makes the component more ergonomic
    let _class: string = "";
    export {_class as class};

</script>


<div class={_class}>
    <img {src} {alt}/>
</div>


<style lang="postcss">
    div {
        @apply bg-gray-800 bg-opacity-30 rounded-full;
    }

</style>