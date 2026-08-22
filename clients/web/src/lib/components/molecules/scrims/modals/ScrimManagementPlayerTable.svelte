<script lang='ts'>
	import type {CurrentScrim} from "$lib/api";
	import {PlayerManagementModal} from "$lib/components/organisms";

	export let targetScrim: CurrentScrim;
	let players: Array<{id: number; name: string; checkedIn: boolean;}> | undefined;
	let playersAdmin: Array<{id: number; name: string;}> | undefined;
	$: {
	    if (targetScrim) {
	        players = targetScrim?.players;
	        playersAdmin = targetScrim?.playersAdmin;
	    }
	}

	let playerManagementModalVisible = false;
	let targetPlayer: {id: number; name: string; checkedIn?: boolean;} | undefined;

	const openPlayerManagementModal = (player: {id: number; name: string; checkedIn?: boolean;}) => {
		playerManagementModalVisible = true;
		targetPlayer = player;
	};
</script>
{#if targetScrim}
	{#if !players && !playersAdmin}
		<p>The players for this scrim are not available.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class='table text-center w-full'>
				<thead>
				<tr>
					<th>Player Name</th>
					<th>Player ID</th>
					<th>Checked In?</th>
					<th />
				</tr>
				</thead>
				<tbody>
				{#each players ?? playersAdmin as player (player.id)}
					<tr>
						<td>{player.name}</td>
						<td>{player.id}</td>
						<td>{player.checkedIn ? "Yes" : "No"}</td>
						<td>
							<button
								class='btn btn-outline float-right lg:btn-sm'
								on:click={() => { openPlayerManagementModal(player) }}
							>
								Manage
							</button>
						</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}

{#if playerManagementModalVisible && targetPlayer}
	<PlayerManagementModal
		player={targetPlayer}
		bind:visible={playerManagementModalVisible}
	/>
{/if}
