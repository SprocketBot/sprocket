<script context="module" lang="ts">
  export const load = ({params}: unknown): unknown => ({
      props: {
          submissionId: params.submissionId,
      },
  });

</script>

<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, SubmissionView, UploadReplaysModal, Spinner, RatificationView,
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
			{#if $submissionStore.data?.submission.items.every(i => i.progress.status === "Complete")}
				<RatificationView submission={$submissionStore?.data?.submission} {submissionId}/>
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
