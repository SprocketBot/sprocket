<script lang="ts">
    import {
        Button, FileBlock, FileInput, Modal,
    } from "$lib/components";
    import {fade} from "svelte/transition";
    import {UploadReplaysStore} from "$houdini";
    import type {FileUpload} from "graphql-upload";
    import type {RemovableFile} from "$lib/components/atoms";

    export let open: boolean = true;
    export let submissionId: string;

    let files: RemovableFile[] = [];
    let submitting: boolean = false;

    async function handleSubmit() {
        if (!files.length) return;
        submitting = true;
        try {
            // TODO is okay to just cast File[] to FileUpload[]?
            const mutator = new UploadReplaysStore();
            console.log("Trying to upload replays");
            console.log(submissionId);
            let vars = {
                submissionId: submissionId as string,
                files: files as unknown as FileUpload[],
            };
            vars.submissionId = submissionId;
            console.log(JSON.stringify(vars));

            await mutator.mutate(vars);
            open = false;
        } catch (_e) {
            console.log(_e);
            submitting = false;
        }
    }
</script>

<Modal title="Upload Replays" bind:open={open}>
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
            <FileInput label="Upload" multiple={true} bind:value={files} />

            {#if files?.length}
                <Button on:click={handleSubmit} variant="success" size="xl">
                    <div slot="body">Submit</div>
                </Button>
            {/if}
        </div>
    </section>
</Modal>