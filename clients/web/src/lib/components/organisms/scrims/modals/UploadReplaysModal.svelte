<script lang="ts">
    import {
        FileBlock, FileInput, Modal,
    } from "$lib/components";
    import {fade} from "svelte/transition";
    import {uploadReplaysMutation} from "$lib/api/mutations/UploadReplays.mutation";
    import type {FileUpload} from "graphql-upload";

    export let visible: boolean = true;
    export let submissionId: string | undefined;

    let rawFiles: FileList;
    let files: File[] = [];
    $: files = [...files, ...Array.from(rawFiles ?? [])].reduce<File[]>((acc: File[], v: File) => {
        if (!acc.some(c => c.name === v.name)) acc.push(v);
        return acc;
    }, []);
    async function handleSubmit() {
        if (!files.length) return;
        await uploadReplaysMutation({
            files: files as FileUpload[],
            submissionId: submissionId,
        });
    }
</script>

<Modal title="Upload Replays" bind:visible id="upload-replays-modal">
    <section slot="body">
        {#if files}
            {#each files as file}
                <div out:fade={{duration: 250}}>
                    <FileBlock filename={file.name} canRemove
                               on:remove={() => { files = files.filter(f => f.name !== file.name) }}
                    />
                </div>
            {/each}
        {/if}
        <div class="actions">
            <FileInput label="Upload" bind:files={rawFiles}/>

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
