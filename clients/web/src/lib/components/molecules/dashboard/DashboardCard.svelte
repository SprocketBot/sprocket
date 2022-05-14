<script lang="ts">
    export let height: 1 | 2 | 3 | 4 | 5 | 6 = 1;
    export let width: 1 | 2 | 3 | 4 | 5 | 6 = 1;
    export let colOverride: 1 | 2 | 3 | 4 | 5 | 6;
    export let rowOverride: number;
    export let title: string
</script>

<section style="grid-column-end: span {width}; grid-row-end: span {height};">
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


    grid-w-1 {
        @apply col-span-1;
    }

    grid-w-2 {
        @apply col-span-2;
    }

    grid-w-3 {
        @apply col-span-3;
    }

    grid-w-4 {
        @apply col-span-4;
    }

    grid-w-5 {
        @apply col-span-5;
    }

    grid-w-6 {
        @apply col-span-6;
    }

    grid-h-1 {
        @apply row-span-1;
    }

    grid-h-2 {
        @apply row-span-2;
    }

    grid-h-3 {
        @apply row-span-3;
    }

    grid-h-4 {
        @apply row-span-4;
    }

    grid-h-5 {
        @apply row-span-5;
    }

    grid-h-6 {
        @apply row-span-6;
    }
</style>
