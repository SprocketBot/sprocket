<script lang="ts">
    import {ScrimManagementModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";
    import type {CurrentScrim} from "../../../api";
    import {activeScrims, type ActiveScrims} from "$lib/api";
    import FaLockOpen from "svelte-icons/fa/FaLockOpen.svelte";
    import FaLock from "svelte-icons/fa/FaLock.svelte";

    /*
    This will be the table that shows in ScrimManagementModal (Currently Named Modal
    but I have since realized that it not the greatest)

    TODO: Create/Implement Search
    TODO: Figure out Visibility status pattern from CreateScrimModal and Scrim Table

     */

    let scrimManagementModalVisible = false;
    let targetId: string;
    let scrimsLocked: boolean = false;

    // TODO: Implement Lock Scrim Workflow


    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;

    let targetScrim: CurrentScrim | undefined;

    let selectedPlayer: string | undefined;

    const selectPlayerInTable = (playerId: string) => {
        selectedPlayer = playerId;
        
    };
    const openScrimManagementModal = (scrimId: string) => {
        scrimManagementModalVisible = true;
        targetId = scrimId;
        const targetScrims = activeScrimsData?.filter(s => s.id === targetId);
        targetScrim = targetScrims ? targetScrims[0] : undefined;
    };

</script>


<table class="table text-center w-full">
    <thead>
    <tr>
        <th>Scrim ID</th>
        <th>Game Mode</th>
        <th>Status</th>
        <th>Players</th>
        <th>
            <button class="float-right btn btn-outline btn-accent" on:click={() => { scrimsLocked = !scrimsLocked }}>
                {#if scrimsLocked }
                    <span class="h-6">
                        <FaLock/>
                    </span>
                {:else}
                    <span class="h-6">
                        <FaLockOpen/>
                    </span>
                {/if}
            </button>
        </th>
    </tr>
    </thead>
    <tbody>
    {#if activeScrimsData?.length}
        {#each activeScrimsData as scrim (scrim.id)}
            <tr>
                <td>{scrim.id}</td>
                <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
                <td>{scrim.status}</td>
                {#if scrim.players?.length >= 1}
                    <td>
                        <div class="flex flex-col gap-1">
                            {#each scrim.players as player (player.id)}
                                <button class="p-2 bg-base-300/20 rounded-lg" on:click = {() => { selectPlayerInTable(`${player.id}`) }}>{player.name}</button>
                            {/each}
                        </div>
                    </td>
                {:else}
                    <td>Scrim still pending</td>
                {/if}
                <td>
                    <button on:click={() => { openScrimManagementModal(scrim.id) }}
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
    <ScrimManagementModal bind:visible={scrimManagementModalVisible} bind:targetScrim={targetScrim}/>
{/if}

<style lang="postcss">
    table {
        @apply select-none;

    }
</style>