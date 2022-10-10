<script lang="ts" context="module">
    export type InputSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
    import shortid from "shortid";
    import type {FormControlState} from "../form.types";

    export let label: string;
    export let size: InputSize = "md";
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;
    export let state: FormControlState = "none";

    const id = shortid.generate();
</script>

<div class="size-{size} state-{state}">
    <label for="input-{id}">{label}</label>
    <input type="text" id="input-{id}" {placeholder} {disabled} />
</div>

<style lang="postcss">
    /* General styling */
    label {
        @apply block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300;
    }

    input {
        @apply block w-full
            rounded-lg border
            outline-none focus:ring-1 focus:ring-primary focus:border-primary
            bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-600
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400;

        &:disabled {
            @apply cursor-not-allowed text-gray-400 placeholder-gray-500;
        }
    }

    /* Size styling */
    .size-sm input {
        @apply p-2 sm:text-xs;
    }

    .size-md input {
        @apply p-2.5 text-sm;
    }

    .size-lg input {
        @apply p-4 sm:text-base;
    }

    /* State styling */
    .state-valid {
        label {
            @apply text-success-700 dark:text-success-500;
        }
        input:not(:disabled) {
            @apply bg-success-50 border-success-500 ring-success-500 text-success-900 placeholder-success-700
                dark:bg-gray-700 dark:border-success-500 dark:ring-success-500 text-success-500 dark:placeholder-success-500;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-700 dark:text-danger-500;
        }
        input:not(:disabled) {
            @apply bg-danger-50 border-danger-500 ring-danger-500 text-danger-900 placeholder-danger-700
                dark:bg-gray-700 dark:border-danger-500 dark:ring-danger-500 text-danger-500 dark:placeholder-danger-500;
        }
    }
</style>
