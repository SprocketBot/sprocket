<script lang='ts'>
  import type {Submission} from "$lib/api";

  import SubmissionProgressView from "./SubmissionProgressView.svelte";
import RatificationView from "./RatificationView.svelte";

  export let submission: Submission;
  export let submissionId: string;
</script>


{#if !["RATIFYING", "RATIFIED"].includes(submission.status)}
	<SubmissionProgressView  {submission} {submissionId} />
{:else}
	<RatificationView {submission} {submissionId}/>
{/if}
