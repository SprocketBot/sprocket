<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {
        cancelScrimMutation,
        lockScrimMutation,
        unlockScrimMutation,
    } from "$lib/api";
    import {UploadReplaysModal} from "$lib/components";

    export let targetScrim: CurrentScrim;

    let visible = false;
    async function cancelScrim(): Promise<void> {
        try {
            await cancelScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    async function lockScrim(): Promise<void> {
        try {
            await lockScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    async function unlockScrim(): Promise<void> {
        try {
            await unlockScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    let uploading = false;

    function uploadReplays(): void {
        uploading = true;
    }
</script>

<section class="space-y-2">
    {#if targetScrim.status === "IN_PROGRESS"}
        <div class="flex items-center">
            <h3 class="flex-1 text-info-content">Upload Replays</h3>
            <div>
                <button on:click={uploadReplays} class="btn btn-primary btn-sm">
                    Upload
                </button>
            </div>
        </div>
    {/if}
    <div class="flex items-center">
        <h3 class="flex-1 text-error-content">Cancel this scrim</h3>
        <div>
            <button
                on:click={cancelScrim}
                class="btn btn-error btn-outline btn-sm"
            >
                Cancel
            </button>
        </div>
    </div>
    {#if targetScrim.status === "LOCKED"}
        <div class="flex items-center">
            <h3 class="flex-1 text-error-content">Unlock this scrim</h3>
            <div>
                <button
                    on:click={unlockScrim}
                    class="btn btn-error btn-outline btn-sm"
                >
                    Unlock
                </button>
            </div>
        </div>
    {:else}
        <div class="flex items-center">
            <h3 class="flex-1 text-error-content">Lock this scrim</h3>
            <div>
                <button
                    on:click={lockScrim}
                    class="btn btn-error btn-outline btn-sm"
                >
                    Lock
                </button>
            </div>
        </div>
    {/if}
</section>

{#if targetScrim && targetScrim.submissionId}
    <UploadReplaysModal
        bind:visible={uploading}
        submissionId={targetScrim.submissionId}
    />
{/if}
