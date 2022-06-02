<script lang="ts">

    import {Modal} from "$lib/components";
    import SubmitReplaysModal from "../modals/SubmitReplaysModal.svelte";
    import {activeScrims, type ActiveScrims, type CurrentScrim} from "$lib/api";

    export let visible = false;
    export let targetScrim: CurrentScrim | undefined;
    let submitting: boolean = false;

    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;
    console.log(activeScrimsData);
    console.log(targetScrim);
</script>

<Modal title="Manage Scrim" id="manage-scrim-modal" visible={visible}>
    <section slot ="body">
        {#if targetScrim && targetScrim?.playerCount > 0}
                <br />
                Someone please help me with HTML, I'm bad at it. Players in the scrim:
                {targetScrim.players}
        {:else}
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
        {/if}
    </section>

</Modal>