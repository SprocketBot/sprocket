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
        <th>Player ID</th>
        <th>Player Name</th>
    </tr>
    </thead>
    <tbody>
        {#if activePlayersData}
            {#each activePlayersData as player (player.id)}
                <tr>
                <td>{player.id}</td>
                <td>{player.name}</td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>