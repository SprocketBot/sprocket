<script lang="ts">
	import type { Player } from '../Player';
	import type { Role } from '../Role';
	import type { League } from '../League';
	import { getContext, setContext } from 'svelte';

	let searchString: string = '';
	const franchise = getContext('franchise');
	const players: Player[] = getContext('players');
	const roles: Role[] = getContext('roles');
	const leagues: League[] = getContext('leagues');

	enum Action {
		Appoint = 'Appoint',
		Dismiss = 'Dismiss',
		Release = 'Release'
	}
	enum Area {
		Leadership = 'Leadership',
		Roster = 'Roster'
	}

	function canBeActioned(action: String, player: Player, area: Area): boolean {
		if (action == Action.Appoint && area == Area.Leadership) {
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
			if (player.roles !== undefined && player.roles.length != 0) {
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
			players.forEach((item: Player, index: number) => {
				if (item === player) players.splice(index, 1);
			});
		}
		setContext('players', players);
		console.log(player);
	}
	function addUserToRoster(searchUser: string) {
		let newPlayer: Player = {
			name: searchUser,
			league: { leagueID: 1, leagueName: 'Foundation League' },
			salary: 5
		};

		players.push(newPlayer);
		searchString = '';
		setContext('players', players);
		console.log(players);
	}
</script>

<section>
	<h1>{franchise}</h1>
	<ul>
		{#each roles as role}
			<h2><b>{role.roleName}</b></h2>
			{#each players as player}
				<li>
					{#if player.roles?.includes(role)}
						{player.name}
						{#each Object.entries(Action) as [key, action]}
							{#if canBeActioned(action, player, Area.Leadership)}
								<button
									class="btn variant-soft-primary btn-sm flex justify-between gap-2 items-center"
									on:click={() => onClickAction(action, player, role)}>{action}</button
								>
							{/if}
						{/each}
					{/if}
				</li>
			{/each}
			<br />
		{/each}
	</ul>
	<ul>
		{#each leagues as league}
			<h2><b>{league.leagueName}</b></h2>
			{#each players as player}
				<li>
					{#if player.league.leagueID === league.leagueID}
						{player.name}
						{#each Object.entries(Action) as [key, action]}
							{#if canBeActioned(action, player, Area.Roster)}
								<button
									class="btn variant-soft-primary btn-sm flex justify-between gap-2 items-center"
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
