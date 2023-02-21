<script lang="ts">
    import type {Action} from "svelte/action";
    import type {ButtonVariant} from "./types";

    type ActionTuple<T> = [Action<HTMLElement, T>, T];

    export let variant: ButtonVariant = "default";
    let _class: string = "";

    export {_class as class};

    export let action: ActionTuple<any> = [() => {}, {}];

    let [a, aParams] = action;

    // TODO: Needs Sizes and outlines
</script>

<button
    class="{_class} button-{variant} focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none flex items-center justify-between"
    use:a={aParams}
>
    <slot />
</button>

<style lang="postcss">
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
