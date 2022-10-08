<script context="module" lang="ts">
    export const load = ({params}: unknown): unknown => ({
        props: {
            submissionId: params.submissionId,
        },
    });
</script>

<script lang="ts">
    import {type Match, MatchStore, SubmissionStore} from "$lib/api";
    import {
        DashboardCard,
        DashboardLayout,
        Spinner,
        SubmissionView,
        UploadReplaysModal,
    } from "$lib/components";

    export let submissionId: string;

    const submissionStore: SubmissionStore = new SubmissionStore(submissionId);

    const matchStore = new MatchStore(submissionId);
    let match: Match | undefined;
    $: match = $matchStore.data?.getMatchBySubmissionId;

    let uploadVisible = false;
</script>

<DashboardLayout>
    <DashboardCard class="col-span-8 row-span-3" title="Submit Replays">
        {#if $submissionStore.fetching || $matchStore?.fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full" />
            </div>
        {:else}
            <header>
                <h2 class="text-3xl font-bold">
                    {match?.matchParent.fixture.scheduleGroup.description} | {match
                        ?.matchParent.fixture.homeFranchise.profile.title} vs {match
                        ?.matchParent.fixture.awayFranchise.profile.title}
                </h2>
                <h3 class="text-2xl font-bold">
                    {match?.gameMode.description} | {match?.skillGroup.profile
                        .description}
                </h3>
            </header>

            {#if match?.rounds?.length}
                <h1>Match has already been submitted.</h1>
            {:else if $submissionStore.data?.submission}
                {#if $submissionStore.data?.submission.status === "REJECTED"}
                    <div>
                        <h3 class="text-error-content text-2xl font-bold">
                            Submission Rejected
                        </h3>
                        <ul class="mb-8">
                            {#key $submissionStore.data?.submission}
                                {#each $submissionStore.data?.submission.rejections.filter(r => !r.stale) as rejection}
                                    <li>
                                        {rejection.playerName} has rejected replays
                                        because "{rejection.reason}"
                                    </li>
                                {/each}
                            {/key}
                        </ul>
                        <button
                            class="btn btn-primary btn-outline"
                            on:click={() => {
                                uploadVisible = true;
                            }}>Resubmit</button
                        >
                        <UploadReplaysModal
                            bind:visible={uploadVisible}
                            {submissionId}
                        />
                    </div>
                {:else}
                    <SubmissionView
                        submission={$submissionStore.data.submission}
                    />
                {/if}
            {:else}
                <button
                    class="btn-large btn-outline btn btn-primary"
                    on:click={() => {
                        uploadVisible = true;
                    }}
                    >Upload Replays
                </button>
                <UploadReplaysModal
                    bind:visible={uploadVisible}
                    {submissionId}
                />
            {/if}
        {/if}
    </DashboardCard>
</DashboardLayout>
