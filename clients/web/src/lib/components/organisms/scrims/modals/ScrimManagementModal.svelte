<script lang="ts">
  import {Collapse, Modal} from "$lib/components";
  import {
      ScrimManagementActions,
      ScrimManagementPlayerTable,
  } from "$lib/components/molecules/scrims/modals";
  import {
      activeScrims, type CurrentScrim,
  } from "$lib/api";

  export let visible = false;
  export let targetScrim: CurrentScrim;
  if (!targetScrim) throw new Error();

  $: {
      if (!$activeScrims.data?.activeScrims?.some(ps => ps.id === targetScrim.id)) {
          visible = false;
      }
  }
  
  let canClickOutside = true;
</script>

<Modal title="Manage Scrim" id="manage-scrim-modal" bind:visible {canClickOutside} size="xl">
  <section slot="body">
    {#if targetScrim?.playerCount > 0}
      <Collapse title="Players">
        <ScrimManagementPlayerTable bind:targetScrim />
      </Collapse>
    {/if}
    <Collapse title="Actions" open >
      <ScrimManagementActions
        bind:targetScrim
        on:uploading={e => {
            canClickOutside = !e.detail;
        }}
      />
    </Collapse>
  </section>
</Modal>

<style lang="postcss">
  h2 {
    @apply text-xl font-bold;
  }
  section {
    @apply flex flex-col gap-4;
  }
</style>
