<script lang="ts">
    import {
    type ActiveScrims, type CurrentScrim,
        activeScrims, } from "$lib/api";
    import {ScrimManagementModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";

    /*
            TODO: Create/Implement Search
            TODO: Figure out Visibility status pattern from CreateScrimModal and Scrim Table
        */

    let scrimManagementModalVisible = false;

    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;

    let targetId: string;
    let targetScrim: CurrentScrim | undefined;
    $: targetScrim = activeScrimsData?.find(s => s.id === targetId);

    let selectedPlayer: string | undefined;

    const selectPlayerInTable = (playerId: string): void => {
        selectedPlayer = playerId;
    };

    const openScrimManagementModal = (scrimId: string): void => {
        scrimManagementModalVisible = true;
        targetId = scrimId;
    };
</script>


<table class="table table-compact table-zebra text-center w-full">
  <thead>
    <tr>
      <th>Scrim ID</th>
      <th>Game</th>
      <th>Skill Group</th>
      <th>Mode</th>
      <th>Status</th>
      <th>Players</th>
      <th />
    </tr>
  </thead>
  <tbody>
    {#if activeScrimsData?.length}
      {#each activeScrimsData as scrim (scrim.id)}
        <tr>
          <td>{scrim.id}</td>
          <td>{scrim.gameMode?.game?.title ?? ""}</td>
          <td>{scrim.skillGroup?.profile?.description}</td>
          <td>{scrim.settings?.competitive ? "Competitive" : "Casual"} {screamingSnakeToHuman(scrim.settings?.mode)} {scrim.gameMode?.description}</td>
          <td>{scrim.status}</td>
          {#if scrim.players?.length || scrim.playersAdmin?.length}
            <td>
              <div class="flex flex-col gap-1">
                {#each scrim.players ?? scrim.playersAdmin as player (player.id)}
                  <button
                    class="p-2 bg-base-300/20 rounded-lg"
                    on:click={() => { selectPlayerInTable(`${player.id}`) }}>
                    {player.name}
                  </button>
                {/each}
              </div>
            </td>
          {:else}
            <td>Players unavailable</td>
          {/if}
          <td>
            <button
              on:click={() => { openScrimManagementModal(scrim.id) }}
              class="btn btn-outline float-right lg:btn-sm">
              Manage
            </button>
          </td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
{#if scrimManagementModalVisible}
  <ScrimManagementModal
    bind:visible={scrimManagementModalVisible}
    bind:targetScrim
  />
{/if}


<style lang="postcss">
  table {
    @apply select-none;
  }
</style>
