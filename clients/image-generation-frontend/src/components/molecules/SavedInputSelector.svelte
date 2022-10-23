<style lang="postcss">
    select {
        @apply bg-primary-500 text-sproc_light_gray-800 px-2 py-1 w-full;
    }
    div {
        @apply bg-primary-500 text-sproc_light_gray-800 px-2 py-1 w-full;
    }
</style>

<script lang="ts">
    export let value;
    export let savedImages: string[];
</script>

<select bind:value>
    {#each savedImages as result}
        <option>{result}</option>
    {/each}
</select>
