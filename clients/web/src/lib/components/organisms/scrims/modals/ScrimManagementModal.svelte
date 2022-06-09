<script lang="ts">
  import {Collapse, Modal} from "$lib/components";
  import {
      ScrimManagementActions,
      ScrimManagementPlayerTable,
  } from "$lib/components/molecules/scrims/modals";
  import {
      activeScrims, type ActiveScrims, type CurrentScrim,
  } from "$lib/api";

  export let visible = false;
  export let targetScrim: CurrentScrim;
  if (!targetScrim) throw new Error();

  let activeScrimsData: ActiveScrims | undefined;
  $: activeScrimsData = $activeScrims?.data?.activeScrims;
</script>

<Modal title="Manage Scrim" id="manage-scrim-modal" bind:visible>
  <section slot="body">
    {#if targetScrim?.playerCount > 0}
      <Collapse title="Players">
        <ScrimManagementPlayerTable bind:targetScrim />
      </Collapse>
    {/if}
    <Collapse title="Actions">
      <ScrimManagementActions bind:targetScrim />
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
