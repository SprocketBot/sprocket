<script context="module" lang="ts">
  export const load = ({params}: unknown): unknown => ({
      props: {
          submissionId: params.submissionId,
      },
  });
</script>

<script lang="ts">
  import type {SubmissionStoreValue} from "$lib/api";
  import {SubmissionStore} from "$lib/api";
  import {
      DashboardCard,
      DashboardLayout,
      SubmissionView,
      UploadReplaysModal,
  } from "$lib/components";

  export let submissionId: string;
  let submissionStore: SubmissionStore | undefined;
  $: if (submissionId) {
      submissionStore = new SubmissionStore(submissionId);
  }
  let submission: SubmissionStoreValue["submission"] | undefined;
  $: if ($submissionStore) submission = $submissionStore?.data?.submission;
</script>

<DashboardLayout>
  <DashboardCard class="col-span-1 md:col-span-2 lg:col-span-5 xl:col-span-5 row-span-1 md:row-span-3">
    {#if submission}
      <SubmissionView {submission} />
    {:else}
      <UploadReplaysModal {submissionId} />
    {/if}
  </DashboardCard>
</DashboardLayout>
