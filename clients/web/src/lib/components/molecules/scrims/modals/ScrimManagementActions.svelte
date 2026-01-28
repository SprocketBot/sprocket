<script lang="ts">
  import type {CurrentScrim} from "$lib/api";
  import {
      cancelScrimMutation,
      lockScrimMutation,
      unlockScrimMutation,
  } from "$lib/api";
  import {UploadReplaysModal} from "$lib/components";
  import {createEventDispatcher} from "svelte";

  export let targetScrim: CurrentScrim;
  
  const dispatch = createEventDispatcher();

  let visible = false;
  async function cancelScrim() {
      try {
          await cancelScrimMutation({scrimId: targetScrim?.id ?? ""});
          visible = false;
      } catch (e) {
          console.warn(e);
      }
  }

  async function lockScrim() {
      try {
          await lockScrimMutation({scrimId: targetScrim?.id ?? ""});
          visible = false;
      } catch (e) {
          console.warn(e);
      }
  }

  async function unlockScrim() {
      try {
          await unlockScrimMutation({scrimId: targetScrim?.id ?? ""});
          visible = false;
      } catch (e) {
          console.warn(e);
      }
  }

  let uploading = false;
  $: dispatch("uploading", uploading);

  function uploadReplays() {
      console.log('Upload Replays button clicked');
      console.log('Current targetScrim:', targetScrim);
      console.log('Setting uploading to true');
      uploading = true;
  }
</script>

<section class="space-y-2">
  {#if targetScrim.status === "IN_PROGRESS"}
    <div class="flex items-center">
      <h3 class="flex-1 text-info-content">Upload Replays</h3>
      <div>
        <button on:click={uploadReplays} class="btn btn-primary btn-sm">
          Upload
        </button>
      </div>
    </div>
  {/if}
  <div class="flex items-center">
    <h3 class="flex-1 text-error-content">Cancel this scrim</h3>
    <div>
      <button on:click={cancelScrim} class="btn btn-error btn-outline btn-sm">
        Cancel
      </button>
    </div>
  </div>
  {#if targetScrim.status === "LOCKED"}
    <div class="flex items-center">
      <h3 class="flex-1 text-error-content">Unlock this scrim</h3>
      <div>
        <button on:click={unlockScrim} class="btn btn-error btn-outline btn-sm">
          Unlock
        </button>
      </div>
    </div>
  {:else}
    <div class="flex items-center">
      <h3 class="flex-1 text-error-content">Lock this scrim</h3>
      <div>
        <button on:click={lockScrim} class="btn btn-error btn-outline btn-sm">
          Lock
        </button>
      </div>
    </div>
  {/if}
</section>
<UploadReplaysModal
  bind:visible={uploading}
  submissionId={targetScrim?.submissionId}
/>
