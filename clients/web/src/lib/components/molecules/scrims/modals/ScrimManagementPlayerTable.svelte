<script lang='ts'>
	import type {CurrentScrim} from "$lib/api";

	export let targetScrim: CurrentScrim;
	let players: Array<{id: number; name: string; checkedIn: boolean;}> | undefined;
	let playersAdmin: Array<{id: number; name: string;}> | undefined;
	$: {
	    if (targetScrim) {
	        players = targetScrim?.players;
	        playersAdmin = targetScrim?.playersAdmin;
	    }
	}
</script>
{#if targetScrim}
	{#if !players && !playersAdmin}
		<p>The players for this scrim are not available.</p>
	{:else}
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
						>
							Manage
						</button>
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{/if}
{/if}
