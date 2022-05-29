<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import UploadReplaysModal from "../modals/UploadReplaysModal.svelte";
    import {BestOfFixture, RoundRobinFixture} from "$lib/components";


    export let scrim: CurrentScrim;

    let uploading: boolean = false;
</script>


<section>
    <h2>Time to Play!</h2>
    <p class="text-accent font-bold tracking-wider">Don't forget to save replays!</p>
    <div>
        {#if scrim.settings.mode === "ROUND_ROBIN"}
            <RoundRobinFixture {scrim}/>
        {:else if scrim.settings.mode === "BEST_OF"}
            <BestOfFixture {scrim}/>
        {/if}
    </div>
    <button on:click={() => { uploading = true }}>
        Upload Replays
    </button>
</section>

<UploadReplaysModal bind:visible={uploading} submissionId={scrim.submissionId}/>


<style lang="postcss">
    section {
        @apply space-y-4;
    }

    h2 {
        @apply text-2xl font-bold text-primary;
    }

    table {
        @apply text-center
    }

    th:not(:last-child) {
        @apply border-r-gray-500 border-r-2;
    }

    th:first-child, td:first-child {
        @apply w-auto;
    }

    button {
        @apply btn btn-primary;
    }
</style>
