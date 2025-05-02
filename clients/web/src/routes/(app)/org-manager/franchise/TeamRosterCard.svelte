<script lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import type { Player } from '$lib/store/models/Player';
	import { players } from '$lib/store/MockDataService.svelte';

	export let league;

	const maxSlotCount = 2;
	let searchString = '';

	function onClickAction(player: Player) {
		$players.forEach((item: Player, index: number) => {
			if (item === player) {
				$players.splice(index, 1);
			}
		});
		$players = $players;
	}

	function countLeaguePlayers(league: DataObject): number {
		return $players.filter((player) => player.league == league).length;
	}

	function addUserToRoster(searchUser: string, league: DataObject) {
		let newPlayer: Player = {
			id: 0,
			name: searchUser,
			league: league,
			salary: 0
		};

		$players.push(newPlayer);
		$players = $players;
		searchString = '';
		console.log($players);
	}
</script>

<section>
	<h2><b>{league.name}</b></h2>
	{#each $players as player}
		<li>
			{#if player.league.id === league.id && player.roles?.find((role) => role.name == 'Playing')}
				{player.name} - {player.salary}
				{#if !player.roles?.find((role) => role.roleCategory == 'Team' || role.roleCategory == 'Franchise')}
					<button class="btn variant-soft-primary btn-sm" on:click={() => onClickAction(player)}
						>Release</button
					>
				{/if}
			{/if}
		</li>
	{/each}
	{#if countLeaguePlayers(league) < maxSlotCount}
		<input bind:value={searchString} />
		<button on:click={() => addUserToRoster(searchString, league)}>Offer</button>
	{/if}
</section>
