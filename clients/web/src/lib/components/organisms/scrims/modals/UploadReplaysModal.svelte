<script lang="ts">
    import type {CombinedError} from "@urql/core";
    import type {FileUpload} from "graphql-upload";
    import {fade} from "svelte/transition";
    
    import {uploadReplaysMutation} from "$lib/api/mutations/UploadReplays.mutation";
    import {
        FileBlock, FileInput, Modal, toasts,
    } from "$lib/components";
    
import type {RemovableFile} from "../../../atoms/FileInput.svelte";

    export let visible = true;
    export let submissionId: string;

    let files: RemovableFile[] = [];
    let submitting = false;

    async function handleSubmit(): Promise<void> {
        if (!files.length) return;
        submitting = true;
        try {
            // TODO is okay to just cast File[] to FileUpload[]?
            await uploadReplaysMutation({
                files: files as unknown as FileUpload[],
                submissionId: submissionId,
            });
            visible = false;
        } catch (_e) {
            const e = _e as CombinedError;
            e.graphQLErrors.forEach(gqlError => {
                toasts.pushToast({
                    status: "info",
                    content: gqlError.message,
                });
            });
            submitting = false;
        }
    }
</script>

<Modal title="Upload Replays" bind:visible id="upload-replays-modal" canClickOutside={false}>
    <section slot="body">
        {#if files}
            {#each files as file (file.name)}
                <div out:fade={{duration: 250}}>
                    <FileBlock
                        filename={file.name}
                        canRemove={!submitting}
                        loading={submitting}
                        on:remove={file.remove}
                    />
                </div>
            {/each}
        {/if}
        <div class="actions">
            <FileInput label="Upload" bind:files />

            {#if files?.length}
                <button on:click={handleSubmit} class="btn btn-primary">
                    Submit
                </button>
            {/if}
        </div>
    </section>
</Modal>


<style lang="postcss">
    section {
        @apply pt-4 space-y-4;
    }

    .actions {
        @apply flex flex-row justify-around;
    }
</style>
