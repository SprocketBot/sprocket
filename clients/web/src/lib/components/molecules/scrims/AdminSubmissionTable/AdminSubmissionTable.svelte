<script lang="ts">
    import {activeSubmissionsStore, type Submission} from "$lib/api";
    import SubmissionDetailModal from "./SubmissionDetailModal.svelte";
    import Row from "./Row.svelte";

    let submissions: Submission[] | undefined;
    $: submissions = $activeSubmissionsStore.data?.activeSubmissions;

    let error: string | undefined;
    $: error = $activeSubmissionsStore.error?.message;

    let selectedSubmission: Submission | undefined;
    let detailModalOpen = false;

    const onRowClick = (s: Submission) => {
        selectedSubmission = s;
        detailModalOpen = true;
    };
</script>

{#if error}
    <div class="text-error">
        <p>An error occurred. Check the network tab for more details.</p>
        <pre>{error}</pre>
    </div>
{/if}

{#if submissions}
    <div class="overflow-x-auto">
        <table class="table table-compact table-zebra text-center w-full">
            <thead>
                <tr>
                    <th>Submission ID</th>
                    <th>Scrim/Match</th>
                    <th>Scrim/Match ID</th>
                    <th>Creator</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {#if submissions}
                    {#each submissions as submission (submission.creatorId)}
                        <Row submission={submission} on:click={() => { onRowClick(submission) }} />
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
{/if}

{#if selectedSubmission}
    <SubmissionDetailModal bind:visible={detailModalOpen} submission={selectedSubmission} />
{/if}


<style lang="postcss">

</style>
