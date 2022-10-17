<style lang="postcss">
    section {
        @apply space-y-4;

        hr {
            @apply w-full mt-2;
        }

        button {
            @apply btn btn-outline btn-sm h-10 md:btn-md md:h-auto;
        }

        .form-control.inline {
            @apply flex flex-row justify-between items-center py-2;
        }

        label {
            @apply contents;
        }

        select {
            @apply mt-2 outline-1 select select-bordered select-sm;

            option {
                @apply py-2;
            }

            &:disabled {
                @apply bg-gray-700 cursor-not-allowed;
            }
        }

        input {
            @apply ml-auto;
        }

        input:disabled {
            @apply text-right px-4 py-1 bg-gray-700;
        }
    }
</style>

<script lang="ts">
    import {slide} from "svelte/transition";

    import {
        type PendingScrim,
        joinScrimMutation,
        pendingScrims,
    } from "$lib/api";
    import {Modal, toasts} from "$lib/components";

    export let visible = true;
    export let scrim: PendingScrim;

    let groupCode: string;
    let joiningWithExistingGroup = false;
    let joining = false;
    let leaveAfter = 1800;

    $: {
        if (
            !$pendingScrims.data?.pendingScrims.some(ps => ps.id === scrim.id)
        ) {
            visible = false;
        }
    }

    async function joinSolo(): Promise<void> {
        joiningWithExistingGroup = false;
        joining = true;
        await joinScrimMutation({
            scrimId: scrim.id,
            leaveAfter: leaveAfter,
        });
        visible = false;
    }

    async function joinAsNewGroup(): Promise<void> {
        joiningWithExistingGroup = false;
        joining = true;
        await joinScrimMutation({
            scrimId: scrim.id,
            createGroup: true,
            leaveAfter: leaveAfter,
        });
        visible = false;
    }

    async function joinExistingGroup(): Promise<void> {
        joining = true;
        try {
            await joinScrimMutation({
                scrimId: scrim.id,
                group: groupCode,
                leaveAfter: leaveAfter,
            });
        } catch (_e) {
            const e = _e as {graphQLErrors: Error[]};
            console.error(e);
            e.graphQLErrors.forEach(error => {
                toasts.pushToast({content: error.message, status: "error"});
            });
        }
        joining = false;
    }
</script>

<Modal title="Join Scrim" bind:visible id="join-scrim-modal">
    <section slot="body">
        <hr />
        <div class="form-control">
            <label class="label" for="scrim-leave-after">
                <span class="label-text">Leave After:</span>
            </label>
            <select name="scrim-leave-after" bind:value={leaveAfter}>
                <option value={1800} selected>30 Minutes</option>
                <option value={3600}>1 Hour</option>
                <option value={10800}>3 Hours</option>
                <option value={21600}>6 Hours</option>
            </select>
        </div>
        <hr />
        <div class="flex items-center">
            <h3 class="flex-1">Play Solo</h3>
            <button on:click={joinSolo} disabled={joining}>Join</button>
        </div>

        {#if scrim.settings.mode === "TEAMS"}
            <div class="divider">or</div>
            <div class="flex items-center justify-between gap-2">
                <h3>Play Together</h3>
                <div class="flex flex-col md:flex-row gap-2">
                    <button on:click={joinAsNewGroup} disabled={joining}
                        >Create group</button
                    >
                    <button
                        on:click={() => {
                            joiningWithExistingGroup =
                                !joiningWithExistingGroup;
                        }}
                        disabled={joining}>Join group</button
                    >
                </div>
            </div>
            {#if joiningWithExistingGroup}
                <div class="flex items-center gap-2" transition:slide>
                    <h3 class="flex-1">Enter Group Code</h3>
                    <input
                        bind:value={groupCode}
                        class="input input-bordered text-primary w-20"
                        placeholder="Code"
                    /> <button on:click={joinExistingGroup}>Join</button>
                </div>
            {/if}
        {/if}
    </section>
</Modal>
