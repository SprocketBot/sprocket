<script context="module" lang="ts">
  export const load = ({ params }: unknown): unknown => ({
    props: {
      submissionId: params.submissionId,
    },
  });
</script>

<script lang="ts">
  import type { SubmissionStoreValue } from "$lib/api";
  import { SubmissionStore } from "$lib/api";
  import { SubmissionView } from "$lib/components";
  import DashboardLayout from "../../../lib/components/layouts/DashboardLayout.svelte";
  import UploadReplaysModal from "../../../lib/components/organisms/scrims/modals/UploadReplaysModal.svelte";

  export let submissionId: string;
  let submissionStore: SubmissionStore | undefined;
  $: if (submissionId) {
    submissionStore = new SubmissionStore(submissionId);
  }
  let submission: SubmissionStoreValue["submission"] | undefined;
  $: if ($submissionStore) {
    submission = $submissionStore?.data?.submission;
    if (submission && submission.games) {
      for (const game of submission.games) {
        console.log(JSON.stringify(game));
      }
    }
  }
</script>

<DashboardLayout>
  {#if submission}
    <SubmissionView {submission} />
  {:else}
    <UploadReplaysModal {submissionId} />
  {/if}
</DashboardLayout>
