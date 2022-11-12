<script lang="ts">
    import type {ProgressBarSize, ProgressBarVariant, ProgressLocation} from "./types";

    // Obviously, this needs to be its own parameter for the 'filled-ness' of
    // the bar
    export let progress = 0;

    // Props to customize which bar you want
    export let size: ProgressBarSize = "default";
    export let progressLocation: ProgressLocation = "hidden";
    export let label: string | undefined;

    // Styling choices
    export let variant: ProgressBarVariant = "info";
</script>

{#if label || progressLocation === "outside"}
    <div class="flex justify-between mb-1 label {variant}">
        <span class="text-base font-medium">{label ?? ""}</span>
        {#if progressLocation === "outside"}
            <span class="text-sm font-medium">{progress}%</span>
        {/if}
    </div>
{/if}

<div class="w-full rounded-full progress {variant}">
    {#if progressLocation !== "inside"}
        <div class="rounded-full size-{size}" style="width: {progress}%" aria-valuenow={progress} />
    {:else}
        <div
            class="font-medium text-center 
                        leading-none rounded-full size-{size} flex items-center justify-center"
            style="width: {progress}%"
            aria-valuenow={progress}
        >
            <span>{progress}%</span>
        </div>
    {/if}
</div>

<style lang="postcss">
    .progress {
        @apply bg-gray-600;
    }

    .info {
        &.progress div {
            @apply bg-info-600 text-info-100;
        }
        &.label {
            @apply text-info-100;
        }
    }

    .primary {
        &.progress div {
            @apply bg-primary-600 text-primary-100;
        }
        &.label {
            @apply text-primary-100;
        }
    }

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
