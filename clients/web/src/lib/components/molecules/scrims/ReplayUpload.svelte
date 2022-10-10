<style lang="postcss">
    .wrapper {
        @apply flex flex-row items-center justify-between
            gap-4 px-4 py-3
            rounded-lg bg-base-200 shadow-md;
    }

    .upload {
        @apply flex flex-col items-start flex-grow flex-shrink overflow-hidden;
    }

    .filename {
        @apply overflow-hidden text-ellipsis mb-1 w-full;
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
    import {cubicOut} from "svelte/easing";
    import {tweened} from "svelte/motion";
    import type {Readable} from "svelte/store";
    import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

    import type {ProgressMessage} from "$lib/utils/types/progress.types";
    import {ProgressStatus} from "$lib/utils/types/progress.types";

    export let filename: string;
    export let progressStore: Readable<ProgressMessage<unknown>>;
    export let canRemove: boolean;

    const dispatch = createEventDispatcher();

    let status: ProgressStatus;
    const value = tweened(0, {
        duration: 200,
        easing: cubicOut,
    });

    $: if ($progressStore) {
        status = $progressStore.status;
        value.set($progressStore.progress.value ?? 0).catch(console.error);
    }
</script>

<div class="wrapper">
    <div class="upload">
        {#if filename}
            <span class="filename">{filename}</span>
        {/if}

        <progress
            value={$value ?? 0}
            max={100}
            class:complete={status === ProgressStatus.Complete}
            class:error={status === ProgressStatus.Error}
        />
    </div>

    <button on:click={() => dispatch("remove")} disabled={!canRemove}>
        <div class="icon"><IoMdClose /></div>
        <span class="sr-only">Remove</span>
    </button>
</div>
