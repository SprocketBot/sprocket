<script lang="ts">

    import {Modal} from "$lib/components";
    import SubmitReplaysModal from "../modals/SubmitReplaysModal.svelte";
    import {activeScrims, type ActiveScrims} from "$lib/api";

    export let visible = false;
    let submitting: boolean = false;

</script>

<Modal title="Manage Scrim" bind:visible id="manage-scrim-modal">
    <section slot ="body">
        <hr/>
        <div class="flex items-center">

            <h3 class="flex-1">Play Solo</h3>
            <div>
                <button>Join</button>
            </div>

        </div>
        <div class="divider"></div>
        <div class="flex items-center gap-2">
            <h3 class="flex-1">Play Together <span class="text-gray-300 text-sm">(Coming Soon)</span></h3>
            <button>Create group</button>
            <button>Join group</button>
        </div>
    </section>

</Modal>