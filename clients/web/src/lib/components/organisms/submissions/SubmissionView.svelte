<script lang="ts">
  import type { Submission } from "$lib/api";

  import SubmissionProgressView from "./SubmissionProgressView.svelte";
  import RatificationView from "./RatificationView.svelte";

  export let submission: Submission;
</script>

{#if !["RATIFYING", "RATIFIED"].includes(submission.status)}
  <SubmissionProgressView {submission} />
{:else}
  <RatificationView {submission} />
{/if}
