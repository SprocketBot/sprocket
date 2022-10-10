<script lang="ts" context="module">
    export type InputSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
    import shortid from "shortid";

    export let label: string;
    export let size: InputSize = "md";

    const id = shortid.generate();
</script>

<div class="size-{size}">
    <label for="input-{id}">{label}</label>
    <input type="text" id="input-{id}" />
</div>

<style lang="postcss">
    label {
        @apply block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300;
    }

    input {
        @apply block w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-info-500 focus:border-info-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-info-500 dark:focus:border-info-500;
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
