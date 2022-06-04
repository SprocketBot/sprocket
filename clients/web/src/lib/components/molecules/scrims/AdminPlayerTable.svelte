<script lang="ts">
    import {activePlayers, type Player} from "$lib/api";
    import {bannedPlayers, type MemberRestrictionEvent} from "$lib/api";

    //export let visible = false;
    let playerManagementModalVisible = false;
    let activePlayersData: Player[] | undefined;
    $: activePlayersData = $activePlayers;

    let targetPlayer;
    //export let selectedPlayer;

    const openPlayerManagementModal = (playerId: number) => {
        playerManagementModalVisible = true;
        targetPlayer = playerId;
    };

</script>

<table>
    <thead>
    <tr>
<!--        <th>Ban Status</th>-->
        <th>Player Name</th>
        <th>Player ID</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
        {#if activePlayersData}
            {#each activePlayersData as player (player.id)}
                <tr>
<!--                <td>{player.banStatus}</td>-->
                <td>{player.name}</td>
                <td>{player.id}</td>
                <td>
                    <button class="btn btn-outline float-right lg:btn-sm" on:click={() => { openPlayerManagementModal(player.id) }}>
                        Manage
                    </button>
                </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>

<style lang="postcss">
    table {
        @apply table text-center w-full;
    }
</style>