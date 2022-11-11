<script lang="ts">
    // Obviously, this needs to be its own parameter for the 'filled-ness' of
    // the bar
    export let progress = 0;

    // Props to customize which bar you want
    export let size = "default";
    export let labelOutside = true;
    export let label: string | undefined;

    // Styling choices
    export let primaryBarColor = "bg-primary-900";
    export let primaryTextClass = "text-primary-200";
</script>

{#if label}
    {#if labelOutside}
        <div class="flex justify-between mb-1">
            <span
                class="text-base font-medium {primaryTextClass}
            dark:{primaryTextClass}">{label}</span
            >
            <span class="text-sm font-medium {primaryTextClass} dark:{primaryTextClass}">{progress}%</span>
        </div>
    {/if}
{/if}

<div class="w-full rounded-full dark:bg-accent-800">
    {#if label}
        {#if labelOutside}
            <div class="{primaryBarColor} rounded-full size-{size}" style="width: {progress}%" />
        {:else}
            <div
                class="{primaryBarColor} font-medium {primaryTextClass} text-center 
                        leading-none rounded-full size-large"
                style="width: {progress}%"
            >
                {progress}%
            </div>
        {/if}
    {:else}
        <div class="{primaryBarColor} rounded-full size-{size}" style="width: {progress}%" />
    {/if}
</div>

<style lang="postcss">
    .size-small {
        @apply h-1.5;
    }

    .size-default {
        @apply h-2.5;
    }

    .size-large {
        @apply h-4;
    }

    .size-extraLarge {
        @apply h-6;
    }
</style>
