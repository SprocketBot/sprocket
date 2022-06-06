<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {RatifySubmissionMutation, SubmissionStatsStore} from "$lib/api";
    import {GameCard, Progress} from "$lib/components";
    import RejectSubmissionModal from "../modals/RejectSubmissionModal.svelte";

    export let scrim: CurrentScrim;
    if (!scrim) throw new Error();
    const submissionId = scrim.submissionId!;

    const submissionStats = new SubmissionStatsStore(submissionId);

    const submissionResults = [false];

    let readyToRatify;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    $: readyToRatify = Array.from(submissionResults).every(Boolean) && submissionResults.length === $submissionStats?.data?.stats?.games.length;
    const hasRatified = false;

    async function ratifyScrim() {
        if (hasRatified) return;
        await RatifySubmissionMutation({submissionId});
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
    {#if !$submissionStats.fetching}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each $submissionStats?.data?.stats?.games as game, gameIndex}
                <GameCard {game} title="Game {gameIndex + 1}" showCheckbox={!hasRatified}
                          bind:checkboxValue={submissionResults[gameIndex]}/>
            {/each}
        </div>

        <Progress value={0} max={0}/>

        {#if !hasRatified}
        <div class="w-full flex justify-around">
            {#if readyToRatify}
                <button class="btn btn-success btn-outline" on:click={ratifyScrim}>Looks good to me!</button>
            {:else}
                <div/>
            {/if}
            <button class="btn btn-error btn-outline" on:click={reject}>These aren't correct</button>
        </div>
        {/if}
    {/if}
</section>

<RejectSubmissionModal bind:visible={rejecting} submissionId={submissionId} />

<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }
</style>
