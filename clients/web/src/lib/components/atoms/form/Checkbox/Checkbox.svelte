<script lang="ts">
    import {slide} from "svelte/transition";
    import {Check} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {nanoid} from "nanoid";
    import type {FormControlState} from "../form.types";

    export let label: string;
    export let value: boolean | undefined = undefined;

    export let disabled: boolean = false;
    export let state: FormControlState = "none";
    export let error: string | undefined = undefined;

    const labelId = `checkbox_${nanoid()}`;
    const errorId = `checkbox-error_${nanoid()}`;
</script>

<div class="state-{state}">
    <div class="flex items-center">
        <div class="relative w-5 h-5">
            <input
                id={labelId}
                type="checkbox"
                bind:checked={value}
                class="appearance-none absolute inset-0 border border-gray-600 rounded focus:ring-2 focus:ring-primary/50 bg-gray-700 checked:bg-primary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:border-gray-500 disabled:text-gray-400"
                {disabled}
            />
            <span
                class="absolute inset-0 grid place-items-center pointer-events-none text-gray-700"
                class:hidden={!value}
            >
                <Icon class="w-4 h-4" src={Check} />
            </span>
        </div>

        <label for={labelId} class="ml-2 text-sm font-medium text-gray-300">
            {label}
        </label>
    </div>

    {#if error && state === "invalid"}
        <span class="error" id={errorId} transition:slide>{error}</span>
    {/if}
</div>

<style lang="postcss">
    /* State styling */
    .state-valid {
        label {
            @apply text-success-500;
        }
    }

    .state-invalid {
        label {
            @apply text-danger-500;
        }
        .error {
            @apply text-danger-500;
        }
    }
</style>
