<script lang="ts">
    import { activePlayers, type Player } from "$lib/api";

    export let visible = false;
    let playerManagementModalVisible = false;
    let activePlayersData: Array<Player> | undefined;
    $: activePlayersData = $activePlayers;

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
                <td>{player.name}</td>
                <td>{player.id}</td>
                <td>
                    <button class="btn btn-outline float-right lg:btn-sm">
                        Manage
                    </button>
                </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>