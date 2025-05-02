<script lang="ts">
	import type { Player } from '$lib/store/models/Player';
	import { franchises, roles, leagues, players } from '$lib/store/MockDataService.svelte';
	import type { Role } from '$lib/store/models/Role';
	import UtilService, { findItemInArray } from '$lib/util/UtilService.svelte';

	let searchString: string = '';
	let util: UtilService;

	enum Action {
		Appoint = 'Appoint',
		Dismiss = 'Dismiss',
		Release = 'Release'
	}
	enum Area {
		Leadership = 'Leadership',
		Roster = 'Roster'
	}
	function getRoleCount(player: Player, roleCategory: string): number {
		let count = 0;
		player.roles?.forEach((role) => {
			if (role.roleCategory == roleCategory) count++;
		});
		return count;
	}

	function canBeActioned(action: String, player: Player, area: Area): boolean {
		if (action == Action.Appoint /*  && area == Area.Leadership */) {
			return false;
		}
		if (action == Action.Dismiss) {
			if (area == Area.Roster) return false;
			if (player.roles === undefined || player.roles.length == 0) {
				return false;
			}
		}
		if (action == Action.Release) {
			if (area == Area.Leadership) return false;
			if (getRoleCount(player, 'Franchise') || getRoleCount(player, 'Team')) {
				return false;
			}
		}
		return true;
	}

	function onClickAction(action: String, player: Player, role?: Role) {
		if (action == Action.Dismiss) {
			player.roles?.forEach((item: Role, index: number) => {
				if (item === role) player.roles?.splice(index, 1);
			});
		}
		if (action == Action.Release) {
			$players.forEach((item: Player, index: number) => {
				if (item === player) {
					$players.splice(index, 1);
				}
			});
		}
		$players = $players;
		console.log(player);
	}
	function addUserToRoster(searchUser: string) {
		let newPlayer: Player = {
			id: 0,
			name: searchUser,
			roles: [util.findItemInArray(3, roles)],
			league: util.findItemInArray(1, leagues),
			salary: 5
		};

		$players.push(newPlayer);
		$players = $players;
		searchString = '';
		console.log($players);
	}
</script>

<section>
	<UtilService bind:this={util} />
	<u><b>{$franchises}</b></u>
	<ul>
		{#each $roles as role}
			{#if role.name != 'Playing' && role.name != 'Non-Playing'}
				<h2><b>{role.name}</b></h2>
				{#each $players as player}
					<li>
						{#if player.roles?.includes(role)}
							{player.name}
							{#each Object.entries(Action) as [key, action]}
								{#if canBeActioned(action, player, Area.Leadership)}
									<button
										class="btn variant-soft-primary btn-sm"
										on:click={() => onClickAction(action, player, role)}>{action}</button
									>
								{/if}
							{/each}
						{/if}
					</li>
				{/each}
				<br />
			{/if}
		{/each}
	</ul>
	<ul>
		{#each $leagues as league}
			<h2><b>{league.name}</b></h2>
			{#each $players as player}
				<li>
					{#if player.league.id === league.id && player.roles?.find((role) => role.name == 'Playing')}
						{player.name}
						{#each Object.entries(Action) as [key, action]}
							{#if canBeActioned(action, player, Area.Roster)}
								<button
									class="btn variant-soft-primary btn-sm"
									on:click={() => onClickAction(action, player)}>{action}</button
								>
							{/if}
						{/each}
					{/if}
				</li>
			{/each}
			<br />
		{/each}
	</ul>
	<input bind:value={searchString} />
	<button on:click={() => addUserToRoster(searchString)}>Offer</button>
</section>
