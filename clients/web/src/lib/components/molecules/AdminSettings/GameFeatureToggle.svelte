<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let label: string;
    export let value: boolean | undefined;
    export let loading: boolean | undefined;

    const id = `game-feature-toggle-${label}`;

    const dispatch = createEventDispatcher();
    
    const onToggle = (): void => {
        dispatch('toggle')
    }
</script>


<div>
    <label for={id}>{label}:</label>
    {#if value !== undefined}
        <span class:enabled={value} class:disabled={!value}>{value ? "Enabled" : "Disabled"}</span>
        <button type="button" id={id} class:loading on:click={onToggle}>{value ? "Disable" : "Enable"}</button>
    {:else}
        <span>Unknown</span>
    {/if}
</div>


<style lang="postcss">
    div {
        @apply flex items-center gap-4 p-1;

        * {
            @apply w-32;
        }
    }

    label {
        @apply text-right;
    }

    span {
        @apply px-3 rounded-lg text-center;

        &.enabled {
            @apply text-green-500 font-bold;
        }

        &.disabled {
            @apply text-red-500 font-bold;
        }
    }

    button {
        @apply btn btn-sm;
    }
</style>