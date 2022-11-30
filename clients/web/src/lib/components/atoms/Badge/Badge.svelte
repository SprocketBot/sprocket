<script lang="ts" context="module">
    export type SizeVariant = "sm" | "md";
    export type ColorVariant = "info" | "gray" | "danger" | "success" | "warning" | "primary" | "secondary";
</script>

<script lang="ts">
    import {fade} from "svelte/transition";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {XMark} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";

    export let size: SizeVariant = "sm";
    export let color: ColorVariant = "info";
    export let icon: IconSource | undefined = undefined;
    export let dismissible = false;
    export let withIcon = true;

    let dismissed = false;
</script>

{#if !dismissed}
    <span
        id="badge-dismiss-default"
        class="size-{size} color-{color} inline-flex items-center mr-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-200 dark:text-blue-800"
    >
        {#if icon}
            <span class="icon">
                <Icon src={icon} />
            </span>
        {/if}
        <slot />
        
        {#if dismissible}
            <button
                on:click={() => (dismissed = true)}
                type="button"
                class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8"
            >
                <span class="sr-only">Close</span>
                <Icon class="w-5 h-5" src={XMark} />
            </button>
        {/if}
    </span>
{/if}

<style lang="postcss">
    .size-sm {
        @apply text-xs font-semibold py-1 px-2;
        .icon{@apply w-3 h-3}
    }
    .size-md {
        @apply text-sm font-medium py-1.5 px-2.5;
        .icon{@apply w-3.5 h-3.5}
    }
    .color-primary{
        @apply bg-primary-100 text-primary-800
    }
    .color-secondary{
        @apply bg-secondary-100 text-secondary-800
    }
    .color-danger{
        @apply bg-danger-100 text-danger-800
    }
    .color-info{
        @apply bg-info-100 text-info-800
    }
    .color-gray{
        @apply bg-gray-100 text-gray-800
    }
    .color-success{
        @apply bg-success-100 text-success-800
    }
    .color-warning{
        @apply bg-warning-100 text-warning-800
    }
</style>
