<script context="module" lang="ts">
  export const load = ({params}: unknown): unknown => ({
      props: {
          submissionId: params.submissionId,
      },
  });

</script>

<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, SubmissionView, UploadReplaysModal, Spinner,
	} from "$lib/components";
	import {SubmissionStore} from "$lib/api";

	export let submissionId: string;

	const submissionStore: SubmissionStore = new SubmissionStore(submissionId);

	let uploadVisible = false;
	$: console.log(uploadVisible);
</script>


<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="Submit Replays">
		{#if $submissionStore.fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else}
		{#if $submissionStore.data?.submission}
			{#if $submissionStore.data?.submission.status === "REJECTED"}
				<div>
					<h3 class="text-error-content text-2xl font-bold">Submission Rejected</h3>
					<ul class="mb-8">
						{#each $submissionStore.data?.submission.rejections as rejection}
							{rejection.playerName} has rejected replays because "{rejection.reason}"
						{/each}
					</ul>
					<button class="btn btn-primary btn-outline" on:click={() => { uploadVisible = true }}>Resubmit</button>
					<UploadReplaysModal bind:visible={uploadVisible} {submissionId}/>
				</div>
			{:else}
				<SubmissionView submission={$submissionStore.data.submission} {submissionId}/>
			{/if}
		{:else}
			<button on:click={() => { uploadVisible = true }}>Upload</button>
			<UploadReplaysModal bind:visible={uploadVisible} {submissionId}/>
		{/if}
		{/if}
	</DashboardCard>
</DashboardLayout>
