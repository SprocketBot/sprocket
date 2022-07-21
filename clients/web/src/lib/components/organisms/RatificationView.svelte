<script lang="ts">
    import type {Submission} from "../../api";
    import {RatifySubmissionMutation} from "../../api";
    import {GameCard, Progress} from "../index";
    import RejectSubmissionModal from "./scrims/modals/RejectSubmissionModal.svelte";

    export let submission: Submission;
    if (!submission) throw new Error();
    export let submissionId: string;


    const submissionResults = [false];

    let readyToRatify;
    $: readyToRatify = Array.from(submissionResults).every(Boolean) && submissionResults.length === submission.stats.games.length;
    let hasRatified = submission.userHasRatified;

    async function ratifyScrim() {
        if (hasRatified) return;
        await RatifySubmissionMutation({submissionId});
        // eslint-disable-next-line require-atomic-updates
        hasRatified = true;
    }

    let rejecting: boolean = false;

    const reject = () => {
        rejecting = true;
    };
</script>

<section class="space-y-4">
    <h2>Replays are done parsing!</h2>
    <p>Now, carefully review the results to make sure we got everything right. Once you have decided a replay is
        correct, click the checkbox in the top right corner</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {#each submission.stats.games as game, gameIndex}
            <GameCard {game} title="Game {gameIndex + 1}" showCheckbox={!hasRatified}
                      bind:checkboxValue={submissionResults[gameIndex]} showResult/>
        {/each}
    </div>

    <Progress value={submission.ratifications} max={submission.requiredRatifications}/>


    <div class="w-full flex justify-around">
        {#if !hasRatified}
            {#if readyToRatify}
                <button class="btn btn-success btn-outline" on:click={ratifyScrim}>Looks good to me!</button>
            {:else}
                <div/>
            {/if}
            <button class="btn btn-error btn-outline" on:click={reject}>These aren't correct</button>
        {:else}
            <span class="text-xl font-bold text-primary">You have already ratified</span>
        {/if}
    </div>



</section>

<RejectSubmissionModal bind:visible={rejecting} submissionId={submissionId} />

<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }
</style>
