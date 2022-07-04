<script context="module" lang="ts">
  export const load = ({params}: unknown): unknown => ({
      props: {
          submissionId: params.submissionId,
      },
  });

</script>

<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, SubmissionView, UploadReplaysModal,
	} from "$lib/components";
	import {SubmissionStore} from "$lib/api";

	export let submissionId: string;

	const submissionStore: SubmissionStore = new SubmissionStore(submissionId);

	let uploadVisible = false;
	$: console.log(uploadVisible);
</script>


<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="Submit Replays">
		{#if $submissionStore.data?.submission}
			<SubmissionView submission={$submissionStore.data.submission} {submissionId}/>
		{:else}
			<button on:click={() => { uploadVisible = true }}>Upload</button>
			<UploadReplaysModal bind:visible={uploadVisible} {submissionId}/>
		{/if}
	</DashboardCard>
</DashboardLayout>
