<script lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import type { Player } from '$lib/store/models/Player';
	import { players } from '$lib/store/MockDataService.svelte';
	import type { Role } from '$lib/store/models/Role';

	export let league: DataObject;
	export let selectedFranchise: DataObject;

	const maxSlotCount = 2;
	let playerCount = countLeaguePlayersInFranchise(league);
	let searchString = '';

	function onClickAction(player: Player) {
		$players.forEach((item: Player) => {
			if (item.id === player.id) {
				let franchiseRole: Role | undefined = player.roles?.find((role) => role.name == 'Playing');
				if (franchiseRole != undefined) {
					let waiverRole: Role = {
						id: 5,
						roleCategory: 'Player',
						name: 'Playing',
						franchiseAssociationID: 98
					};
					player.roles?.splice(
						player.roles.findIndex((role) => role.name == 'Playing'),
						1,
						waiverRole
					);
				}
			}
		});
		$players = $players;
		playerCount = countLeaguePlayersInFranchise(league);
	}

	function playingForFranchise(player: Player): boolean {
		let role = player.roles?.find(
			(role) => role.name == 'Playing' && role.franchiseAssociationID == selectedFranchise.id
		);
		return role != undefined;
	}

	function countLeaguePlayersInFranchise(league: DataObject): number {
		let count = $players.filter(
			(player) => player.league.id == league.id && playingForFranchise(player)
		).length;
		return count;
	}

	function addUserToRoster(searchUser: string, league: DataObject) {
		let newPlayer: Player = {
			id: 0,
			name: searchUser,
			roles: [
				{
					id: 5,
					roleCategory: 'Player',
					name: 'Playing',
					franchiseAssociationID: selectedFranchise.id
				}
			],
			league: league,
			salary: 0
		};
		$players.push(newPlayer);
		$players = $players;
		playerCount = countLeaguePlayersInFranchise(league);
		searchString = '';
	}
</script>

<section>
	<h2><b>{league.name}</b></h2>
	{#each $players as player}
		<li>
			{#if player.league.id === league.id && playingForFranchise(player)}
				{player.name} - {player.salary}
				{#if !player.roles?.find((role) => role.roleCategory == 'Team' || role.roleCategory == 'Franchise')}
					<button class="btn variant-soft-primary btn-sm" on:click={() => onClickAction(player)}
						>Release</button
					>
				{/if}
			{/if}
		</li>
	{/each}
	{#if playerCount < maxSlotCount}
		<input bind:value={searchString} />
		<button on:click={() => addUserToRoster(searchString, league)}>Offer</button>
	{/if}
</section>
