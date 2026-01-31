<script lang="ts">
    import {activePlayers, type Player} from "$lib/api";
    import {PlayerManagementModal} from "../../organisms/index.js";
    import FaHammer from "svelte-icons/fa/FaHammer.svelte";

    let playerManagementModalVisible = false;
    let activePlayersData: Player[] | undefined;
    $: activePlayersData = $activePlayers;
    let targetPlayer: Player;

    const openPlayerManagementModal = (player: Player) => {
        playerManagementModalVisible = true;
        targetPlayer = player;
    };
</script>

<div class="overflow-x-auto">
    <table class="table table-compact table-zebra text-center w-full" >
        <thead>
            <tr>
                <th>Player Name</th>
                <th>Player ID</th>
                <td/>
            </tr>
        </thead>
        <tbody>
        {#if activePlayersData}
            {#each activePlayersData as player (player.id)}
                <tr>
                    <td>{player.name}</td>
                    <td>{player.id}</td>
                    <td>
                        <button class="btn btn-outline float-right lg:btn-sm"
                                on:click={() =>  { openPlayerManagementModal(player) } }>
                                <span class="h-3.5 w-4">
                                    <FaHammer/>
                                </span>
                        </button>
                    </td>
                </tr>
            {/each}
        {/if}
        </tbody>
    </table>
</div>

{#if playerManagementModalVisible}
    <PlayerManagementModal
            player={targetPlayer}
            bind:visible={playerManagementModalVisible}
    />
{/if}

<style lang="postcss">
    table {
        @apply table text-center w-full;
    }
</style>
