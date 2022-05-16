<script lang="ts">
    export let title: string;

    let _class: string = "";
    export {_class as class};
</script>

<section class="{_class}">
    {#if title}
        <header>
            {title ?? ""}
        </header>
    {/if}
    <div class:push={title}>
        <slot/>
    </div>
</section>


<style lang="postcss">
    section {
        @apply bg-base-100/10 p-8 drop-shadow-xl flex flex-col justify-between items-stretch relative;
    }

    header {
        @apply h-4 absolute top-4;
    }
    div {
        @apply flex-1;
    }
</style>
