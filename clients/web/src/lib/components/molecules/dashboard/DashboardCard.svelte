<style lang="postcss">
    section {
        @apply bg-base-100/10 p-8 drop-shadow-xl flex flex-col justify-between items-stretch relative;
    }

    header {
        @apply mb-4;
        h2 {
            @apply mb-2;
            &:not(.quietTitle) {
                @apply text-4xl font-bold text-sprocket;
            }
            &.quietTitle {
                @apply font-bold text-xl text-center;
            }
        }
    }

    div {
        @apply flex-1;
    }
</style>

<script lang="ts">
    export let title: string;
    export let quietTitle = false;

    let _class = "";
    export {_class as class};
</script>

<section class={_class}>
    {#if title}
        <header>
            <h2 class:quietTitle>{title ?? ""}</h2>
        </header>
    {/if}
    <div class:push={title}>
        <slot />
    </div>
</section>
