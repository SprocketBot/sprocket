<style lang="postcss">
    div {
        @apply bg-gray-800 bg-opacity-30 rounded-full;
    }
</style>

<script lang="ts">
    export let src = "/img/default_profile.png";
    export let alt = "Your Profile Picture";

    // Slight hack to expose a prop as "class"
    // Just makes the component more ergonomic
    let _class = "";
    export {_class as class};
</script>

<div class={_class}>
    <img {src} {alt} />
</div>
