<script lang="ts">
    import {ScrimManagementModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";
    import {
        setScrimsDisabledMutation, type CurrentScrim,
    } from "../../../api";
    import {
        scrimsDisabled, activeScrims, type ActiveScrims,
    } from "$lib/api";
    import FaLockOpen from "svelte-icons/fa/FaLockOpen.svelte";
    import FaLock from "svelte-icons/fa/FaLock.svelte";

    /*
            TODO: Create/Implement Search
            TODO: Figure out Visibility status pattern from CreateScrimModal and Scrim Table
        */

    let scrimManagementModalVisible = false;
    
    let scrimsAreDisabled: boolean;
    $: scrimsAreDisabled = $scrimsDisabled.data?.getScrimsDisabled;

    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;

    let targetId: string;
    let targetScrim: CurrentScrim | undefined;
    $: targetScrim = activeScrimsData?.find(s => s.id === targetId);

    let selectedPlayer: string | undefined;

    const selectPlayerInTable = (playerId: string) => {
        selectedPlayer = playerId;
    };

    const openScrimManagementModal = (scrimId: string) => {
        scrimManagementModalVisible = true;
        targetId = scrimId;
    };

    const toggleScrimsDisabled = async (disabled: boolean) => {
        try {
            await setScrimsDisabledMutation({disabled});
        } catch {
            console.log(`Failed to ${disabled ? "disable" : "enable"} scrims`);
        }
    };
</script>

<table class="table text-center w-full">
  <thead>
    <tr>
      <th>Game</th>
      <th>Mode</th>
      <th>Status</th>
      <th>Players</th>
      <th>
        <button
          class="float-right btn btn-outline btn-accent btn-sm"
          on:click={async () => {
            await toggleScrimsDisabled(!scrimsAreDisabled);
          }}
        >
          <span class="h-3.5 w-4">
            {#if scrimsAreDisabled}
              <FaLock />
            {:else}
              <FaLockOpen />
            {/if}
          </span>
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    {#if activeScrimsData?.length}
      {#each activeScrimsData as scrim (scrim.id)}
        <tr>
          <td>{scrim.gameMode.game.title}</td>
          <td>{scrim.settings.competitive ? "Competitive" : "Casual"} {screamingSnakeToHuman(scrim.settings.mode)} {scrim.gameMode.description}</td>
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
