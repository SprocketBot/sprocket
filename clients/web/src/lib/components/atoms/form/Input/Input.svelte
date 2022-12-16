<script lang="ts">
    import {slide} from "svelte/transition";
    import {nanoid} from "nanoid";

    import type {FormControlSize, FormControlState} from "../form.types";

    export let size: FormControlSize = "md";
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;
    export let value: string | undefined = undefined;

    const labelId = `input_${nanoid()}`;
    const errorId = `input-error_${nanoid()}`;
</script>

<div class="size-{size} state-{state}">
    <label for={labelId}>{label}</label>

    <div class="input-container">
        {#if $$slots.addonLeft}
            <div class="addon">
                <slot name="addonLeft" />
            </div>
        {/if}

        <input
            id={labelId}
            type="text"
            bind:value
            aria-describedby={error ? errorId : undefined}
            {placeholder}
            {disabled}
        />

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
        @apply block mb-2 text-sm font-medium text-gray-300;
    }

    .input-container {
        @apply flex items-stretch
            rounded-lg border overflow-hidden
            focus-within:ring-1 focus-within:ring-primary focus-within:border-primary
            bg-gray-700 border-gray-600 text-white placeholder-gray-400;

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
                @apply w-full flex items-center justify-center text-gray-400;
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
            @apply text-success-500;
        }
        .input-container {
            @apply dark:bg-gray-700 dark:border-success-500 dark:ring-success-500 dark:text-success-500 dark:placeholder-success-700;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-500;
        }
        .input-container {
            @apply dark:bg-gray-700 dark:border-danger-500 dark:ring-danger-500 dark:text-danger-500 dark:placeholder-danger-700;
        }
        .error {
            @apply text-danger-500;
        }
    }
</style>
