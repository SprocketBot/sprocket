<script lang="ts" context="module">
    export type InputSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
    import shortid from "shortid";

    export let label: string;
    export let size: InputSize = "md";
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;

    const id = shortid.generate();
</script>

<div class="size-{size}">
    <label for="input-{id}">{label}</label>
    <input type="text" id="input-{id}" {placeholder} {disabled} />
</div>

<style lang="postcss">
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

    .size-sm input {
        @apply p-2 sm:text-xs;
    }

    .size-md input {
        @apply p-2.5 text-sm;
    }

    .size-lg input {
        @apply p-4 sm:text-base;
    }
</style>
