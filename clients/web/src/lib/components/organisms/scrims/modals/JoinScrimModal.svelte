<script lang="ts">
    import {slide} from "svelte/transition";
    import {joinScrimMutation} from "$lib/api";
    import {Modal, toasts} from "$lib/components";

    export let visible = true;
    export let scrimId: string;

    let groupCode: string;
    let joiningAsGroup: boolean = false;
    let joining: boolean = false;

    async function joinSolo() {
        joiningWithExistingGroup = false;
        joining = true;
        await joinScrimMutation({
            scrimId: scrimId,
        });
        visible = false;
    }

    async function joinAsNewGroup() {
        joiningAsGroup = false;
        joining = true;
        await joinScrimMutation({
            scrimId: scrimId,
            createGroup: true,
        });
        visible = false;
    }

    async function joinExistingGroup() {
        joining = true;
        try {
            await joinScrimMutation({
                scrimId: scrimId,
                group: groupCode,
            });
        } catch (_e) {
            const e = _e as {graphQLErrors: Error[];};
            console.error(e);
            e.graphQLErrors.forEach(error => { toasts.pushToast({content: error.message, status: "error"}) });
        }
        joining = false;


    }
</script>

<Modal title="Join Scrim" bind:visible id="join-scrim-modal">
    <section slot="body">
        <hr/>
        <div class="flex items-center">
            <h3 class="flex-1">Play Solo</h3>
            <div>
                <button on:click={joinSolo} disabled={joining}>Join</button>
            </div>

        </div>
        <div class="divider">or</div>
        <div class="flex items-center gap-2">
            <h3 class="flex-1">Play Together</h3>
            <button on:click={joinAsNewGroup} disabled={joining}>Create group</button>
            <button on:click={() => { joiningAsGroup = !joiningAsGroup }} disabled={joining}>Join group</button>
        </div>
        {#if joiningWithExistingGroup}
            <div class='flex items-center gap-2' transition:slide>
                <h3 class='flex-1'>Enter Group Code</h3>
                <input bind:value={groupCode} class='input input-bordered text-primary w-20' placeholder='Code'/> <button on:click={joinExistingGroup}>Join</button>
            </div>
        {/if}
    </section>
</Modal>

<style lang="postcss">
    section {
        @apply space-y-4;

        hr {
            @apply w-full mt-2;
        }

        button {
            @apply btn btn-outline;

        }
    }
</style>
