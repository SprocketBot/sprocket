<script lang="ts">
    import {activePlayers, type Player} from "$lib/api";
    import {bannedPlayers, type MemberRestrictionEvent} from "$lib/api";

    //export let visible = false;
    let playerManagementModalVisible = false;
    let activePlayersData: Player[] | undefined;
    $: activePlayersData = $activePlayers;
    let bannedPlayersData: MemberRestrictionEvent[] | undefined;
    $: bannedPlayersData = $bannedPlayers?.data?.getActiveMemberRestrictions;

    console.log(bannedPlayersData)
    let targetPlayer;
    //export let selectedPlayer;

    const openPlayerManagementModal = (playerId: number) => {
        playerManagementModalVisible = true;
        targetPlayer = playerId;
    };

</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
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
            {#if bannedPlayersData}
            {#each bannedPlayersData as restriction (restriction.id)}
                <tr>
                    <td>{restriction.member.profile.name}</td>
                    <td>{restriction.id}</td>
                    <td>
                        <button class="btn btn-outline lg:btn-sm">
                            Unban
                        </button>
                    </td>
                </tr>
            {/each}
            {/if}
        {/if}
    </tbody>
</table>

<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>