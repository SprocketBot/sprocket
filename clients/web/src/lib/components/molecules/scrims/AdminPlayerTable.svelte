<script lang="ts">
    import {activePlayers, type Player} from "$lib/api";
    import {PlayerManagementModal} from "../../organisms/index.js";
    import FaHammer from "svelte-icons/fa/FaHammer.svelte";

    let playerManagementModalVisible = false;
    let activePlayersData: Player[] | undefined;
    $: activePlayersData = $activePlayers;
    let targetPlayer: Player;
    let rankOutsEnabled: boolean;
    $: rankOutsEnabled = true;

    const openPlayerManagementModal = (player: Player) => {
        playerManagementModalVisible = true;
        targetPlayer = player;
    };

    const toggleRankOuts = async (enabled: boolean) => {
        try {
            // await toggleRankOutMutation({enabled});
            // eslint-disable-next-line no-alert
            if (window.confirm(`${enabled ? "Are you sure you want to enable Rankouts?" : "Are you sure you want to disable Rankouts?"}`)) {

                rankOutsEnabled = !rankOutsEnabled;
                console.log(`RankOuts have been toggled - Currently set to ${enabled ? "enabled" : "disabled"}`);
            }

        } catch {
            console.log(`Failed to ${enabled ? "enable" : "disabled"} RankOuts`);
        }
    };
</script>

<table class="table table-compact table-zebra text-center w-full" >
    <thead>
        <tr>
            <th>Player Name</th>
            <th>Player ID</th>
            <th>RankOuts: <button
                    class="btn btn-outline btn-accent btn-sm "
                    on:click= {async () => {
                        await toggleRankOuts(!rankOutsEnabled);
                    }}
            >
                <span class="justify-center">
                {#if rankOutsEnabled}
                    <label class="flex"> On </label>
                    {:else}
                    <label class="flex"> Off </label>
                    {/if}
                </span>
                </button>
            </th>
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
