<style lang="postcss">
    .wrapper {
        @apply flex flex-row items-center justify-between
        gap-4 px-4 py-3
        rounded-lg bg-base-200/50 shadow-md;
    }

    .upload {
        @apply flex items-start flex-grow flex-shrink min-w-0 pr-8;
    }

    .filename {
        @apply overflow-hidden text-ellipsis mb-1 flex-1 whitespace-nowrap min-w-0;
    }

    progress {
        @apply progress progress-primary bg-base-100 h-4;

        &.complete {
            @apply progress-success;
        }

        &.error {
            @apply progress-error;
        }
    }

    button {
        @apply btn btn-circle btn-error h-fit w-fit min-h-0 p-1 text-base-200;
    }

    .icon {
        @apply w-4 h-4;
    }
</style>

<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    import {Spinner} from "$lib/components";

    export let filename: string;
    export let canRemove: boolean;
    export let loading = false;

    const dispatch = createEventDispatcher();
</script>

<div class="wrapper">
    <div class="upload">
        {#if filename}
            <span class="filename">{filename}</span>
        {/if}
        {#if loading}
            <span class="h-8">
                <Spinner />
            </span>
        {/if}
    </div>
    <button on:click={() => dispatch("remove")} disabled={!canRemove}>
        <div class="icon">
            <IoMdClose />
        </div>
        <span class="sr-only">Remove</span>
    </button>
</div>
