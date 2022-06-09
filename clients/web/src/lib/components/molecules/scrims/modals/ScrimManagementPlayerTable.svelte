<script lang='ts'>
	import type {CurrentScrim} from "$lib/api";

	export let targetScrim: CurrentScrim;
</script>
{#if targetScrim}
	{#if !targetScrim.players && !targetScrim.playersAdmin}
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
			{#each targetScrim.players ?? targetScrim.playersAdmin as player (player.id)}
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
