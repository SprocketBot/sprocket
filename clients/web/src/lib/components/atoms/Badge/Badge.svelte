<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon";
    import {XMark} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import type { BadgeColorVariant, BadgeSizeVariant } from './types';

    export let size: BadgeSizeVariant = "sm";
    export let color: BadgeColorVariant = "info";
    export let icon: IconSource | undefined = undefined;
    export let dismissible = false;

    let dismissed = false;
</script>

{#if !dismissed}
    <span
        class="size-{size} color-{color} inline-flex mr-2 rounded items-center gap-1"
    >
        {#if icon}
            <span class="icon">
                <Icon src={icon} class="h-full w-full" />
            </span>
        {/if}
        <slot />
        {#if dismissible}
            <button
                on:click={() => (dismissed = true)}
                type="button"
                class="ml-auto -mx-1.5 rounded-lg focus:ring-2"
            >
                <span class="sr-only">Close</span>
                <Icon class="w-4 h-4" src={XMark} />
            </button>
        {/if}
    </span>
{/if}

<style lang="postcss">
    .size-sm {
        @apply text-xs py-1 px-2 leading-none;
        .icon{@apply w-3 h-3}
    }
    .size-md {
        @apply text-sm py-1.5 px-2.5 leading-none;
        .icon{@apply w-3.5 h-3.5}
    }
    .color-primary{
        @apply bg-primary-800 text-primary-100
    }
    .color-secondary{
        @apply bg-secondary-800 text-secondary-100
    }
    .color-danger{
        @apply bg-danger-800 text-danger-100
    }
    .color-info{
        @apply bg-info-800 text-info-100
    }
    .color-gray{
        @apply bg-gray-800 text-gray-100
    }
    .color-success{
        @apply bg-success-800 text-success-100
    }
    .color-warning{
        @apply bg-warning-800 text-warning-100
    }
</style>
