<script lang="ts">
    import type {ButtonActionTuple, ButtonSize, ButtonVariant} from "./types";

    export let variant: ButtonVariant = "default";
    export let size: ButtonSize = "default";
    export let outline = false;
    let _class = "";

    export {_class as class};

    // We need to have some no-op function
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    export let action: ButtonActionTuple<any> = [() => {}, {}];

    let [a, aParams] = action;

    // TODO: Needs Sizes and outlines
</script>

<button
    class="{_class} button-{variant} button-size-{size} focus:ring-4 font-medium rounded-lg focus:outline-none flex items-center justify-between"
    class:has-outline={outline}
    use:a={aParams}
    on:click
>
    <slot />
</button>

<style lang="postcss">
    .button-size-default {
        @apply px-5 py-2.5 text-sm;
    }
    .button-size-xs {
        @apply px-3 py-2 text-xs;
    }
    .button-size-sm {
        @apply px-3 py-2 text-sm;
    }
    .button-size-lg {
        @apply px-5 py-3 text-base;
    }
    .button-size-xl {
        @apply px-6 py-3.5 text-base;
    }

    .button-default {
        @apply text-white border focus:ring-info-800;
        &:not(.has-outline) {
            @apply bg-info-600 hover:bg-info-700 border-transparent;
        }
        &.has-outline {
            @apply border-info-600 hover:border-info-700;
        }
    }
    .button-primary {
        @apply text-white border focus:ring-primary-800;
        &:not(.has-outline) {
            @apply bg-primary-600 hover:bg-primary-700 border-transparent;
        }
        &.has-outline {
            @apply border-primary-600 hover:border-primary-700;
        }
    }
    .button-alt {
        @apply border focus:z-10 focus:ring-gray-700 text-gray-100 hover:text-white;
        &:not(.has-outline) {
            @apply bg-gray-800 border-gray-600 hover:bg-gray-900;
        }
        &.has-outline {
            @apply border-gray-800 hover:border-gray-900;
        }
    }
    .button-success {
        @apply border text-white focus:ring-success-800;
        &:not(.has-outline) {
            @apply bg-success-600 hover:bg-success-700;
        }
        &.has-outline {
            @apply border-success-600 hover:border-success-700;
        }
    }
    .button-danger {
        @apply border text-white focus:ring-danger-900;
        &:not(.has-outline) {
            @apply bg-danger-600 hover:bg-danger-700;
        }
        &.has-outline {
            @apply border-danger-600 hover:border-danger-700;
        }
    }
    .button-warning {
        @apply border text-white focus:ring-warning-900;
        &:not(.has-outline) {
            @apply bg-warning-400 hover:bg-warning-500;
        }
        &.has-outline {
            @apply border-warning-400 hover:border-warning-500;
        }
    }
</style>
