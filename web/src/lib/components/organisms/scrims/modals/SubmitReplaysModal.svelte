<script lang="ts" context="module">
    import { ProgressMessage, ProgressStatus } from "$lib/utils/types/progress.types";

    export interface Replay {
        id: string;
        file?: File;
        progressStore?: Readable<ProgressMessage<unknown>>;
    }

    export type SubmitReplaysModalStatus = "init" | "uploaded" | "parsing";
</script>


<script lang="ts">
    import {FileInput, Modal} from "$lib/components";
    import ReplayUpload from "$lib/components/molecules/scrims/ReplayUpload.svelte";
    import {derived, Readable} from "svelte/store";
    import shortid from "shortid";
    import {fade} from "svelte/transition";
    import {uploadReplaysMutation} from "$lib/api/mutations/UploadReplays.mutation";
    import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
    import FaTimesCircle from 'svelte-icons/fa/FaTimesCircle.svelte'
    import { FollowReplayUploadStore } from "$lib/api/subscriptions/FollowReplayUpload.subscription";
    import { findLast } from "$lib/utils/findLast";

    export let visible: boolean = true;
    export let submissionId: string | undefined;

    //////////
    // Local variables
    //////////
    let files: FileList;
    let replays: Replay[] = [];
    let status: SubmitReplaysModalStatus = "init";
    
    //////////
    // Local stores
    //////////
    let followReplayUploadStore: FollowReplayUploadStore;
    let allComplete: Readable<boolean>;
    let anyError: Readable<boolean>;

    //////////
    // Handlers
    //////////
    const handleRemove = (id: string) => {
        replays = replays.filter(r => r.id !== id);
        if (replays.length === 0) status = "init";
    };

    const handleUpload = async (files: FileList) => {
        if (!files || !files.length) return;
        
        const _replays = Array.from(files).map(file => ({
            id: shortid.generate(),
            file: file,
        }));

        replays = [...replays, ..._replays];
        status = "uploaded";
    };

    const handleSubmit = async () => {
        if (!replays.length) return;

        followReplayUploadStore = new FollowReplayUploadStore({ submissionId });
        status = "parsing";

        const { parseReplays: taskIds } = await uploadReplaysMutation({
            files: replays.map(r => r.file),
            submissionId: submissionId,
        });

        for (let i = 0; i < replays.length; i++) {
            // Set each progressStore to the most recent progress message from followReplayUploadStore
            replays[i].progressStore = derived(
                followReplayUploadStore,
                $value => {
                    const latestMsg = findLast($value, msg => msg?.data.followReplayParse.taskId === taskIds[i])
                    const progress = latestMsg?.data.followReplayParse
                    console.log(`${progress?.taskId}\t${progress?.progress.value}`);
                    return progress;
                }
            )
        }

        allComplete = derived(
            replays.map(r => r.progressStore),
            $progresses => {
                const _progresses = [...$progresses]; // convert `empty` to undefined
                return Boolean(_progresses.length) && _progresses.every(p => p?.status === ProgressStatus.Complete)
            }
        );

        anyError = derived(
            replays.map(r => r.progressStore),
            $progresses => {
                const _progresses = [...$progresses]; // convert `empty` to undefined
                return Boolean(_progresses.length) && _progresses.some(p => p?.status === ProgressStatus.Error)
            }
        );
    };

    // Load files when they change
    $: handleUpload(files);
</script>


<Modal title="Submit Replays" bind:visible id="submit-replays-modal">
    <section slot="body">
        {#if replays}
            {#each replays as replay (replay.id)}
                <div out:fade={{duration: 250}}>
                    <ReplayUpload
                        filename={replay.file.name}
                        progressStore={replay.progressStore}
                        canRemove={["init", "uploaded"].includes(status)}
                        on:remove={() => { handleRemove(replay.id) }}
                    />
                </div>
            {/each}
        {/if}

        <div class="actions">
            {#if ["init", "uploaded"].includes(status)}
                <FileInput label="Upload" bind:files={files} />
            {/if}

            {#if status === "uploaded"}
                <button on:click={handleSubmit}>
                    Submit
                </button>
            {:else if status === "parsing"}
                {#if $allComplete}
                    <span class="check"><FaCheckCircle /></span>
                {:else if $anyError}
                    <span class="x"><FaTimesCircle /></span>
                {:else}
                    Parsing...
                {/if}
            {/if}
        </div>
    </section>
</Modal>


<style lang="postcss">
    section { @apply pt-4 space-y-4; }

    button { @apply btn btn-primary; }

    .actions { @apply flex flex-row justify-around; }

    .check { @apply w-12 h-12 text-success; }

    .x { @apply w-12 h-12 text-error; }
</style>
