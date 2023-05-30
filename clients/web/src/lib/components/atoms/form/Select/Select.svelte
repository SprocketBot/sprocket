<script lang="ts">
    import {slide} from "svelte/transition";
    import {nanoid} from "nanoid";

    import type {FormControlSize, FormControlState} from "../form.types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {ChevronDown} from "@steeze-ui/heroicons";
    import type {SelectOptions, SelectOptionValue} from "./types";

    // Define generic so that options and value have the same type
    type T = $$Generic<SelectOptionValue>;
    interface $$Props {
        label: string;
        value?: T;
        options: SelectOptions<T>;

        size?: FormControlSize;
        placeholder?: string;
        disabled?: boolean;
        state?: FormControlState;
        error?: string;
    }

    export let label: string;
    export let value: T | undefined = undefined;
    export let options: SelectOptions<T> = [];

    export let size: FormControlSize = "md";
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;

    const labelId = `select_${nanoid()}`;
    const errorId = `select-error_${nanoid()}`;
</script>

<div class="size-{size} state-{state}" class:disabled>
    <label for={labelId} class="block mb-2 text-sm font-medium text-gray-300">{label}</label>

    <div class="relative">
        <select
            id={labelId}
            class:placeholder={placeholder && !value}
            class="appearance-none w-full flex items-stretch rounded-lg border outline-none focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-gray-700 border-gray-600 text-white"
            bind:value
            aria-describedby={error ? errorId : undefined}
            {disabled}
        >
            {#if placeholder}
                <option class="bg-gray-700 text-gray-50" value={undefined} disabled selected hidden
                    >{placeholder}</option
                >
            {/if}

            {#each options as option}
                <option class="bg-gray-700 text-gray-50" value={option.value}>{option.label}</option>
            {/each}
        </select>

        <span class="icon absolute h-full top-0 flex items-center pointer-events-none">
            <Icon class="h-5/10" src={ChevronDown} />
        </span>
    </div>

    {#if error && state === "invalid"}
        <span class="error" id={errorId} transition:slide>{error}</span>
    {/if}
</div>

<style lang="postcss">
    /* General styling */
    select {
        &:disabled {
            @apply cursor-not-allowed placeholder-gray-500;
        }

        &.placeholder {
            @apply text-gray-400;
        }
    }

    /* Size styling */
    .size-sm {
        select {
            @apply p-2 sm:text-xs;
        }

        .icon {
            @apply right-2;
        }
    }

    .size-md {
        select {
            @apply p-2.5 text-sm;
        }

        .icon {
            @apply right-2.5;
        }
    }

    .size-lg {
        select {
            @apply p-4 sm:text-base;
        }

        .icon {
            @apply right-4;
        }
    }

    /* State styling */
    .state-valid {
        label {
            @apply text-success-500;
        }
        select {
            @apply dark:bg-gray-700 dark:border-success-500 dark:ring-success-500 dark:text-success-500 dark:placeholder-success-700;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-500;
        }
        select {
            @apply dark:bg-gray-700 dark:border-danger-500 dark:ring-danger-500 dark:text-danger-500 dark:placeholder-danger-700;
        }
        .error {
            @apply text-danger-500;
        }
    }
</style>
