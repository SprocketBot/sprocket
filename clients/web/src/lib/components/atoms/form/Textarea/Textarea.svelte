<script lang="ts">
    import {slide} from "svelte/transition";
    import {nanoid} from "nanoid";

    import type {FormControlSize, FormControlState} from "../form.types";

    export let size: FormControlSize = "md";
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;
    export let value: string | undefined = undefined;

    const labelId = `textarea_${nanoid()}`;
    const errorId = `textarea-error_${nanoid()}`;

    let rows: number;
    $: {
        switch (size) {
            case "sm":
                rows = 2;
                break;
            case "md":
                rows = 4;
                break;
            case "lg":
                rows = 8;
                break;
        }
    }
</script>

<div class="size-{size} state-{state}">
    <label for={labelId}>{label}</label>
    <textarea id={labelId} bind:value aria-describedby={error ? errorId : undefined} {rows} {placeholder} {disabled} />

    {#if error && state === "invalid"}
        <span class="error" id={errorId} transition:slide>{error}</span>
    {/if}
</div>

<style lang="postcss">
    /* General styling */
    label {
        @apply block mb-2 text-sm font-medium text-gray-300;
    }

    textarea {
        @apply w-full flex items-stretch
            rounded-lg border outline-none
            focus-within:ring-1 focus-within:ring-primary focus-within:border-primary
            bg-gray-700 border-gray-600 text-white placeholder-gray-400;

        &:disabled {
            @apply cursor-not-allowed text-gray-400 placeholder-gray-500;
        }
    }

    /* Size styling */
    .size-sm textarea {
        @apply p-2 sm:text-xs;
    }

    .size-md textarea {
        @apply p-2.5 text-sm;
    }

    .size-lg textarea {
        @apply p-4 sm:text-base;
    }

    /* State styling */
    .state-valid {
        label {
            @apply text-success-500;
        }
        textarea {
            @apply dark:bg-gray-700 dark:border-success-500 dark:ring-success-500 dark:text-success-500 dark:placeholder-success-700;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-500;
        }
        textarea {
            @apply dark:bg-gray-700 dark:border-danger-500 dark:ring-danger-500 dark:text-danger-500 dark:placeholder-danger-700;
        }
        .error {
            @apply text-danger-500;
        }
    }
</style>
