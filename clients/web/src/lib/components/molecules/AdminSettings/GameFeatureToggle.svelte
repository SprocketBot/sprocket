<script lang="ts">
    export let label: string;
    export let value: boolean;
    export let loading: boolean;

    const id = `game-feature-toggle-${label}`;
</script>


<div>
    <label for={id}>{label}:</label>
    <span class:enabled={value} class:disabled={!value}>{value ? "Enabled" : "Disabled"}</span>
    <button type="button" id={id} class:loading>{value ? "Disable" : "Enable"}</button>
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