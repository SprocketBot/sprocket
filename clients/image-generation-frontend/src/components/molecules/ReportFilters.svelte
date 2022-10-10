<style lang="postcss">
    label {
        @apply flex flex-col mx-4;
    }
    label span {
        @apply font-bold;
    }
    select {
        @apply bg-primary-500 text-sproc_light_gray-800 px-2 py-1 w-full;
    }
</style>

<script lang="ts">
    import type {FilterValues} from "$src/types";

    export let values;
    export let filters: FilterValues[];
</script>

{#each filters as filter}
    <label>
        <span>{filter.name}</span>
        <select bind:value={values[filter.code]}>
            {#each filter.data as option}
                <option value={option.value}>
                    {option.description}
                </option>
            {/each}
        </select>
    </label>
{/each}
