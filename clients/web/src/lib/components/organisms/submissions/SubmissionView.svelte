<script lang='ts'>
  import type {Submission} from "$lib/api";

  import RatificationView from "./RatificationView.svelte";
  import SubmissionProgressView from "./SubmissionProgressView.svelte";

  export let submission: Submission;
</script>


{#if !["RATIFYING", "RATIFIED"].includes(submission.status)}
	<SubmissionProgressView  {submission} />
{:else}
	<RatificationView {submission} />
{/if}
