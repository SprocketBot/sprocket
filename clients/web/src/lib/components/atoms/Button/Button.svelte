<script lang="ts">
    import type {ButtonActionTuple, ButtonSize, ButtonVariant} from "./types";

    export let variant: ButtonVariant = "default";
    export let size: ButtonSize = "default";
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
        @apply text-white bg-info-600 hover:bg-info-700 focus:ring-info-800;
    }
    .button-alt {
        @apply border focus:z-10 focus:ring-gray-700 bg-gray-800 text-gray-100 border-gray-600 hover:text-white hover:bg-gray-800;
    }
    .button-dark {
        @apply text-white bg-gray-800 hover:bg-gray-700 focus:ring-gray-700 border-gray-700;
    }
    .button-light {
        @apply border bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700;
    }
    .button-success {
        @apply text-white  bg-success-600 hover:bg-success-700 focus:ring-success-800;
    }
    .button-danger {
        @apply text-white  bg-danger-600 hover:bg-danger-700 focus:ring-danger-900;
    }
    .button-warning {
        @apply text-white bg-warning-400 hover:bg-warning-500 focus:ring-warning-900;
    }
</style>
