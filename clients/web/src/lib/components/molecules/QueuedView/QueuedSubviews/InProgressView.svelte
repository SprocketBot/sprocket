<script lang="ts">
    import type {
        CurrentScrim, Submission, SubmissionRejection,
    } from "$lib/api";
    import UploadReplaysModal from "../modals/UploadReplaysModal.svelte";
    import {TeamsFixture, RoundRobinFixture} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";
    import FaExclamationTriangle from "svelte-icons/fa/FaExclamationTriangle.svelte";


    export let scrim: CurrentScrim;
    export let submission: Submission | undefined;

    let uploading: boolean = false;
    let lastRejection: SubmissionRejection | undefined;
    $: lastRejection = submission?.rejections[submission?.rejections.length - 1];
</script>

<section>
    <h2>Time to Play!</h2>

    {#if lastRejection}
    <div class="flex flex-col gap-2 mb-20">
        <div class="alert alert-error justify-start gap-6">
            <span class="w-6 h-6">
                <FaExclamationTriangle />
            </span>

            <div class="flex flex-col gap-1 items-start justify-start text-white">
                <span class="font-bold">{lastRejection.playerName} rejected the uploaded replays</span>
                <span>{lastRejection.reason}</span>
                <span class="mt-2">Please upload the correct replays, or contact support if you think this is a mistake.</span>
            </div>
        </div>

        <button on:click={() => { uploading = true }} class="w-full md:w-auto">
            Upload Replays Again
        </button>
    </div>

    {/if}
    
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
                <dd><code>{scrim.lobby.name}</code></dd>
                <dt>Password</dt>
                <dd><code>{scrim.lobby.password}</code></dd>
            </dl>
        </div>
    </div>
    <div>
        {#if scrim.settings.mode === "ROUND_ROBIN"}
            <RoundRobinFixture {scrim}/>
        {:else if scrim.settings.mode === "TEAMS"}
            <TeamsFixture {scrim}/>
        {/if}
    </div>

    {#if !lastRejection}
        <button on:click={() => { uploading = true }} class="w-full md:w-auto">
            Upload Replays
        </button>
    {/if}
</section>

<UploadReplaysModal bind:visible={uploading} submissionId={scrim.submissionId}/>


<style lang="postcss">
    section {
        @apply flex flex-col gap-4;
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
