<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    export let filename: string;
    export let canRemove: boolean;

    const dispatch = createEventDispatcher();
</script>

<div class="wrapper">
    <div class="upload">
        {#if filename}
            <span class="filename">{filename}</span>
        {/if}
    </div>
    <button on:click={() => dispatch("remove")} disabled={!canRemove}>
        <div class="icon"><IoMdClose /></div>
        <span class="sr-only">Remove</span>
    </button>
</div>

<style lang="postcss">
    .wrapper {
        @apply
        flex flex-row items-center justify-between
        gap-4 px-4 py-3
        rounded-lg bg-base-200/50 shadow-md;
    }

    .upload { @apply flex flex-col items-start flex-grow flex-shrink overflow-hidden; }

    .filename { @apply overflow-hidden text-ellipsis mb-1 w-full; }

    progress {
        @apply progress progress-primary bg-base-100 h-4;

        &.complete { @apply progress-success; }
        &.error { @apply progress-error; }
    }

    button {
        @apply btn btn-circle btn-error h-fit w-fit min-h-0 p-1 text-base-200;
    }

    .icon {
        @apply w-4 h-4;
    }
</style>
