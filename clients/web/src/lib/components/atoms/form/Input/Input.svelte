<script lang="ts" context="module">
    export type InputSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
    import {slide} from "svelte/transition";
    import shortid from "shortid";

    import type {FormControlState} from "../form.types";

    export let size: InputSize = "md";
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;

    const labelId = `input_${shortid.generate()}`;
    const errorId = `input-error_${shortid.generate()}`;
</script>

<div class="size-{size} state-{state}">
    <label for={labelId}>{label}</label>

    <div class="input-container">
        {#if $$slots.addonLeft}
            <div class="addon">
                <slot name="addonLeft" />
            </div>
        {/if}

        <input id={labelId} type="text" aria-describedby={error ? errorId : undefined} {placeholder} {disabled} />

        {#if $$slots.addonRight}
            <div class="addon">
                <slot name="addonRight" />
            </div>
        {/if}
    </div>

    {#if error && state === "invalid"}
        <span class="error" id={errorId} transition:slide>{error}</span>
    {/if}
</div>

<style lang="postcss">
    /* General styling */
    label {
        @apply block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300;
    }

    .input-container {
        @apply flex items-stretch
            rounded-lg border overflow-hidden
            focus-within:ring-1 focus-within:ring-primary focus-within:border-primary
            bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-600
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400;

        input {
            @apply min-h-[fit-content] flex-1 outline-none bg-transparent;
            &:disabled {
                @apply cursor-not-allowed text-gray-400 placeholder-gray-500;
            }
        }

        .addon {
            @apply aspect-square flex-shrink-0
                flex items-center justify-center
                pointer-events-none select-none;

            /* Default styling for addon */
            & > :global(*) {
                @apply w-full flex items-center justify-center text-gray-600 dark:text-gray-400;
            }
        }
    }

    /* Size styling */
    .size-sm {
        input {
            @apply p-2 sm:text-xs;
        }
        .addon {
            @apply h-8;
        }
    }

    .size-md {
        input {
            @apply p-2.5 text-sm;
        }
        .addon {
            @apply h-10;
        }
    }

    .size-lg {
        input {
            @apply p-4 sm:text-base;
        }
        .addon {
            @apply h-14;
        }
    }

    /* State styling */
    .state-valid {
        label {
            @apply text-success-700 dark:text-success-500;
        }
        .input-container {
            @apply bg-success-50 border-success-500 ring-success-500 text-success-700 placeholder-success-700
                dark:bg-gray-700 dark:border-success-500 dark:ring-success-500 dark:text-success-500 dark:placeholder-success-500;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-700 dark:text-danger-500;
        }
        .input-container {
            @apply bg-danger-50 border-danger-500 ring-danger-500 text-danger-700 placeholder-danger-700
                dark:bg-gray-700 dark:border-danger-500 dark:ring-danger-500 dark:text-danger-500 dark:placeholder-danger-500;
        }
        .error {
            @apply text-danger-600 dark:text-danger-500;
        }
    }
</style>
