<script lang="ts">
    import type {
        CurrentScrim, Submission, SubmissionRejection,
    } from "$lib/api";
    import UploadReplaysModal from "../modals/UploadReplaysModal.svelte";
    import {BestOfFixture, RoundRobinFixture} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";


    export let scrim: CurrentScrim;
    export let submission: Submission | undefined;

    let uploading: boolean = false;
    let rejections: SubmissionRejection[] | undefined;
    $: rejections = submission?.rejections;
</script>

<section>
    <h2>Time to Play!</h2>
    <p class="text-accent font-bold tracking-wider">
        Don't forget to save replays!
    </p>
    <div class="lobby">
        <div>
            <h3>Lobby Information</h3>
            <dl>
                <dt>Skill Group:</dt>
                <dd>{scrim.skillGroup?.profile?.description}</dd>
                <dt>Game Mode</dt>
                <dd>{scrim.settings.competitive ? "Competitive" : "Casual"} {screamingSnakeToHuman(scrim.settings.mode)} {scrim.gameMode.description}</dd>
                <dt>Name</dt>
                <dd>{scrim.lobby.name}</dd>
                <dt>Password</dt>
                <dd>{scrim.lobby.password}</dd>
            </dl>
        </div>
    </div>
    <div>
        {#if scrim.settings.mode === "ROUND_ROBIN"}
            <RoundRobinFixture {scrim}/>
        {:else if scrim.settings.mode === "BEST_OF"}
            <BestOfFixture {scrim}/>
        {/if}
    </div>

    {#if rejections?.length}
        <h2 class="text-error">Replays Rejected</h2>
        <ul class="list-disc list-inside">
        {#each rejections.filter(r => !r.stale) as rejection}
            <li>{rejection.playerName} rejected the uploaded replays because "{rejection.reason}"</li>
        {/each}
        </ul>
        <p class="mt-4">You can upload replays again:</p>
    {/if}


    <button on:click={() => { uploading = true }} class="w-full md:w-auto">
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
        @apply text-center;
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

    div.lobby {
        @apply bg-base-100/20 rounded-lg p-4;
        h3 {
            @apply font-bold;
        }
        dl {
            @apply pl-4;
            dt {
                @apply font-bold;
            }
            dd {
                @apply pl-4 text-accent;
            }
        }
    }
</style>
