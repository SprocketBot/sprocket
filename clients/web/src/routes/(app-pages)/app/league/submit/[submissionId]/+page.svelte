<script lang="ts">
    export let data;
    console.log(JSON.stringify(data));

    import {
        Button, SubmissionView, UploadReplaysModal, Spinner,
    } from "$lib/components";
    import type {Match$result, Submission$result} from '$houdini';
    import type { Match, Submission } from "$lib/api";
    
    export let submissionId: string;
    
    let submissionResult : Submission$result;
    let submissionData: Submission;
    if (data.ssData) {
        console.log("We have submission data");
        submissionResult = data.ssData;
        submissionResult?.submission as unknown as Submission;
    } else {
        console.log("We do not have submission data.");
    }

    let matchResult : Match$result;
    let match : Match;
    if (data.msData) {
        matchResult = data.msData;
        match = matchResult?.getMatchObjectBySubmissionId;
    }
    
	if (!submissionId) submissionId = data.submissionId;
    let uploadVisible = false;
</script>

{#if !submissionResult && !matchResult}
	<!-- <div class="h-full w-full flex items-center justify-center">
		<Spinner class="h-16 w-full" />
	</div> -->
    Sorry, loading the data for you right now. 
{:else}
	<header>
		<h2 class="text-3xl font-bold">{match?.matchParent.fixture.scheduleGroup.description} | {match?.matchParent.fixture.homeFranchise.profile.title} vs {match?.matchParent.fixture.awayFranchise.profile.title}</h2>
		<h3 class="text-2xl font-bold">{match?.gameMode.description} | {match?.skillGroup.profile.description}</h3>
	</header>
	{#if match?.rounds?.length}
		<h1>Match has already been submitted.</h1>
	{:else if submissionResult?.submission}
		{#if submissionResult.submission.status === "REJECTED"}
			<div>
				<h3 class="text-error-content text-2xl font-bold">Submission Rejected</h3>
				<ul class="mb-8">
					{#key submissionResult.submission}
						{#each submissionResult.submission.rejections.filter(r => !r.stale) as rejection}
							<li>{rejection.userId} has rejected replays because "{rejection.reason}"</li>
						{/each}
					{/key}
				</ul>
				<button class="btn btn-primary btn-outline" on:click={() => { uploadVisible = true }}>Resubmit</button>
				<UploadReplaysModal bind:open={uploadVisible} {submissionId} />
			</div>
		{:else}
			<SubmissionView submission={submissionData} />
		{/if}
	{:else}
		<Button size="xl" variant="primary" on:click={() => { uploadVisible = true }}>
			<div>Upload Replays</div>
		</Button>
		<UploadReplaysModal bind:open={uploadVisible} bind:submissionId={submissionId} />
	{/if}
{/if}