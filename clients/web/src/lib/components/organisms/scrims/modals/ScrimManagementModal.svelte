<script lang="ts">
    import {Modal, UploadReplaysModal} from "$lib/components";
    import {
        activeScrims,
        type ActiveScrims,
        cancelScrimMutation,
        type CurrentScrim,
    } from "$lib/api";
    import {
        lockScrimMutation,
        unlockScrimMutation,
    } from "../../../../api/mutations/SetScrimLocked.mutation";

    export let visible = false;
    export let targetScrim: CurrentScrim | undefined;

    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;

    async function cancelScrim() {
        try {
            await cancelScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    async function lockScrim() {
        try {
            await lockScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    async function unlockScrim() {
        try {
            await unlockScrimMutation({scrimId: targetScrim?.id ?? ""});
            visible = false;
        } catch (e) {
            console.warn(e);
        }
    }

    let uploading = false;

    function uploadReplays() {
        uploading = true;
    }
</script>

<Modal title="Manage Scrim" id="manage-scrim-modal" bind:visible>
    <section slot="body">
        {#if uploading}
            <UploadReplaysModal
                bind:visible={uploading}
                submissionId={targetScrim?.submissionId}
            />
        {:else if targetScrim && targetScrim?.playerCount > 0}
            {#if !targetScrim.players && !targetScrim.playersAdmin}
                <p>The players for this scrim are not available.</p>
            {:else}
                Here are the players:
                <table class="table text-center w-full">
                    <thead>
                        <tr>
                            <th>Player Name</th>
                            <th>Player ID</th>
                            <th>Checked In?</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {#each targetScrim.players ?? targetScrim.playersAdmin as player (player.id)}
                            <tr>
                                <td>{player.name}</td>
                                <td>{player.id}</td>
                                <td>{player.checkedIn ? "Yes" : "No"}</td>
                                <td>
                                    <button
                                        class="btn btn-outline float-right lg:btn-sm"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
            {#if targetScrim.status === "IN_PROGRESS"}
                <div class="divider" />
                <div class="flex items-center">
                    <h3 class="flex-1 text-info-content">
                        Now you can also upload replays.
                    </h3>
                    <div>
                        <button
                            on:click={uploadReplays}
                            class="btn btn-primary
                             btn-sm"
                            >Upload
                        </button>
                    </div>
                </div>
            {/if}
            <div class="divider" />
            <div class="flex items-center">
                <h3 class="flex-1 text-error-content">Cancel this scrim</h3>
                <div>
                    <button
                        on:click={cancelScrim}
                        class="btn btn-error btn-outline btn-sm">Cancel</button
                    >
                </div>
            </div>
            {#if targetScrim.status === "LOCKED"}
                <div class="flex items-center">
                    <h3 class="flex-1 text-error-content">Unlock this scrim</h3>
                    <div>
                        <button
                            on:click={unlockScrim}
                            class="btn btn-error btn-outline btn-sm"
                            >Unlock</button
                        >
                    </div>
                </div>
            {:else}
                <div class="flex items-center">
                    <h3 class="flex-1 text-error-content">Lock this scrim</h3>
                    <div>
                        <button
                            on:click={lockScrim}
                            class="btn btn-error btn-outline btn-sm"
                            >Lock</button
                        >
                    </div>
                </div>
            {/if}
        {:else}
            Target Scrim does not exist, sorry.
        {/if}
    </section>
</Modal>
