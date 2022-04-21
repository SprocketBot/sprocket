<script lang="ts">
    import {joinScrimMutation} from "$lib/api";
    import {Modal} from "$lib/components";

    export let visible = true;
    export let scrimId: string;


    async function joinSolo() {
        await joinScrimMutation({
            scrimId: scrimId,
        });
        visible = false;
    }

    function joinAsNewGroup() {
    }

    function joinExistingGroup() {
    }
</script>

<Modal title="Join Scrim" bind:visible id="join-scrim-modal">
    <section slot="body">
        <hr/>
        <div class="flex items-center">

                <h3 class="flex-1">Play Solo</h3>
            <div>
                <button on:click={joinSolo}>Join</button>
            </div>

        </div>
        <div class="divider">or</div>
        <div class="flex items-center gap-2">
            <h3 class="flex-1">Play Together <span class="text-gray-300 text-sm">(Coming Soon)</span></h3>
            <button on:click={joinAsNewGroup} title="Coming Soon" disabled>Create group</button>
            <button on:click={joinExistingGroup} title="Coming Soon" disabled>Join group</button>
        </div>
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
