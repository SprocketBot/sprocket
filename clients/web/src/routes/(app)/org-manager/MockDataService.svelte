<script lang="ts">
	import { setContext } from 'svelte';
	import type { Player } from './Player';
	import type { Role } from './Role';
	import type { League } from './League';

	export const franchise = setContext('franchise', 'Express');

	export const roles: Role[] = setContext('roles', [
		{ roleID: 1, roleCategory: 'Franchise', roleName: 'Franchise Manager' },
		{ roleID: 2, roleCategory: 'Team', roleName: 'General Manager' },
		{ roleID: 3, roleCategory: 'Team', roleName: 'Assistant General Manager' },
		{ roleID: 4, roleCategory: 'Team', roleName: 'Captain' }
	]);

	export const leagues: League[] = setContext('leagues', [
		{ leagueID: 1, leagueName: 'Foundation League' },
		{ leagueID: 2, leagueName: 'Academy League' },
		{ leagueID: 3, leagueName: 'Champion League' },
		{ leagueID: 4, leagueName: 'Master League' },
		{ leagueID: 5, leagueName: 'Premier League' }
	]);

	export const players: Player[] = setContext('players', [
		{ name: 'hermod', roles: [getRole(1)], league: getLeague(4), salary: 15.5 },
		{ name: 'mattdamon', roles: [getRole(2)], league: getLeague(3), salary: 13 },
		{ name: 'copex', roles: [getRole(3)], league: getLeague(4), salary: 16, playing: false },
		{ name: 'gogurt', roles: [getRole(3)], league: getLeague(3), salary: 13, playing: false },
		{ name: 'fatality', roles: [getRole(4)], league: getLeague(4), salary: 16.5 },
		{ name: 'hobo', roles: [getRole(4)], league: getLeague(4), salary: 14.5 },
		{ name: 'massimo', roles: [getRole(4)], league: getLeague(5), salary: 20 },
		{ name: 'ouiiid', roles: [getRole(4)], league: getLeague(2), salary: 11 }
	]);

	function getRole(id: number): Role {
		let role: Role | undefined;
		role = roles.find((item) => item.roleID === id);
		if (role === undefined || role === null) {
			throw new TypeError('This value was promised to be there.');
		}
		return role;
	}
	function getLeague(id: number): League {
		let league: League | undefined;
		league = leagues.find((i) => i.leagueID == id);
		if (league === undefined || league === null) {
			throw new TypeError('This value was promised to be there.');
		}
		return league;
	}
</script>
