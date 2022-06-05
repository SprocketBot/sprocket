<script lang="ts">
    import { activePlayers, type Player } from "$lib/api";
    import { PlayerManagementModal } from "../../organisms/index.js";
    import FaHammer from "svelte-icons/fa/FaHammer.svelte";

    // export let visible = false;
    let playerManagementModalVisible = false;
    let activePlayersData: Player[] | undefined;
    $: activePlayersData = $activePlayers;
    let targetPlayer: number;
    // export let selectedPlayer;

    const openPlayerManagementModal = (playerId: number) => {
        playerManagementModalVisible = true;
        targetPlayer = playerId;
    };
</script>

<table>
    <thead>
        <tr>
            <th>Player Name</th>
            <th>Player ID</th>
            <th
                ><textarea class="input-bordered bg-base-300/20 w-3" rows="1">
                    Player Search:
                </textarea></th
            >
        </tr>
    </thead>
    <tbody>
        {#if activePlayersData}
            {#each activePlayersData as player (player.id)}
                <tr>
                    <td>{player.name}</td>
                    <td>{player.id}</td>
                    <td>
                        <button
                            class="btn btn-outline float-right lg:btn-sm"
                            on:click={() => {
                                openPlayerManagementModal(player.id);
                            }}
                        >
                            <span class="h-6">
                                <FaHammer />
                            </span>
                        </button>
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>

{#if playerManagementModalVisible}
    <PlayerManagementModal
        playerId={targetPlayer}
        bind:visible={playerManagementModalVisible}
    />
{/if}

<style lang="postcss">
    table {
        @apply table text-center w-full;
    }
</style>
