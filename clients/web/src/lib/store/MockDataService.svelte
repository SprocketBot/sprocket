<script context="module" lang="ts">
	import { writable, get, type Writable } from 'svelte/store';
	import type { Player } from './models/Player';
	import type { DataObject } from './models/DataObject';
	import type { Role } from './models/Role';
	import type { Seat } from './models/Seat';
	import type { Assignment } from './models/Assignment';

	export const franchises = writable<DataObject[]>([
		{ id: 1, name: 'Express' },
		{ id: 97, name: 'Pending' },
		{ id: 98, name: 'Waiver Wire' },
		{ id: 99, name: 'Free Agent' }
	]);

	export const games = writable<DataObject[]>([
		{ id: 1, name: 'Rocket League' },
		{ id: 2, name: 'Trackmania' },
		{ id: 3, name: 'Counter Strike 2' },
		{ id: 4, name: 'Valorant' }
	]);

	export const roles = writable<Role[]>([
		{ id: 1, roleCategory: 'Franchise', name: 'Franchise Manager' },
		{ id: 2, roleCategory: 'Team', name: 'General Manager' },
		{ id: 3, roleCategory: 'Team', name: 'Assistant General Manager' },
		{ id: 4, roleCategory: 'Team', name: 'Captain' },
		{ id: 5, roleCategory: 'Player', name: 'Player' },
		{ id: 6, roleCategory: 'Franchise', name: 'Public Relations' }
	]);

	export const roleSeats = writable<Seat[]>([
		{ id: 1, roleID: 1 },
		{ id: 2, roleID: 2, gameID: 1 },
		{ id: 3, roleID: 3, gameID: 1 },
		{ id: 4, roleID: 3, gameID: 1 },
		{ id: 5, roleID: 4, gameID: 1 },
		{ id: 6, roleID: 4, gameID: 1 },
		{ id: 7, roleID: 4, gameID: 1 },
		{ id: 8, roleID: 4, gameID: 1 },
		{ id: 9, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 10, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 11, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 12, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 13, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 14, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 15, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 16, roleID: 5, gameID: 1, leagueID: 2 },
		{ id: 17, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 18, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 19, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 20, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 21, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 22, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 23, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 24, roleID: 5, gameID: 1, leagueID: 3 },
		{ id: 25, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 26, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 27, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 28, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 29, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 30, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 31, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 32, roleID: 5, gameID: 1, leagueID: 4 },
		{ id: 33, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 34, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 35, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 36, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 37, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 38, roleID: 5, gameID: 1, leagueID: 5 },
		{ id: 39, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 40, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 41, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 42, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 43, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 44, roleID: 5, gameID: 1, leagueID: 1 },
		{ id: 45, roleID: 6 },
		{ id: 46, roleID: 6 }
	]);

	export const roleAssignments = writable<Assignment[]>([
		{ id: 1, seatID: 1, franchiseID: 1, playerID: 1 },
		{ id: 2, seatID: 2, franchiseID: 1, playerID: 2 },
		{ id: 3, seatID: 3, franchiseID: 1, playerID: 3 },
		{ id: 5, seatID: 5, franchiseID: 1, playerID: 5 },
		{ id: 6, seatID: 6, franchiseID: 1, playerID: 6 },
		{ id: 7, seatID: 7, franchiseID: 1, playerID: 7 },
		{ id: 8, seatID: 8, franchiseID: 1, playerID: 8 },
		{ id: 9, seatID: 9, franchiseID: 1, playerID: 8 },
		{ id: 10, seatID: 18, franchiseID: 1, playerID: 2 },
		{ id: 11, seatID: 19, franchiseID: 1, playerID: 6 },
		{ id: 12, seatID: 25, franchiseID: 1, playerID: 1 },
		{ id: 13, seatID: 26, franchiseID: 1, playerID: 5 },
		{ id: 14, seatID: 34, franchiseID: 1, playerID: 7 }
	]);

	export const leagues = writable<DataObject[]>([
		{ id: 1, name: 'Foundation League' },
		{ id: 2, name: 'Academy League' },
		{ id: 3, name: 'Champion League' },
		{ id: 4, name: 'Master League' },
		{ id: 5, name: 'Premier League' }
	]);

	export const players = writable<Player[]>([
		{
			id: 1,
			name: 'hermod',
			salary: 15.5
		},
		{
			id: 2,
			name: 'mattdamon',
			salary: 13
		},
		{
			id: 3,
			name: 'copex',
			salary: 16
		},
		{
			id: 4,
			name: 'gogurt',
			salary: 13
		},
		{
			id: 5,
			name: 'fatality',
			salary: 16.5
		},
		{
			id: 6,
			name: 'hobo',
			salary: 14.5
		},
		{
			id: 7,
			name: 'massimo',
			salary: 20
		},
		{
			id: 8,
			name: 'ouiiid',
			salary: 11
		}
	]);
</script>
