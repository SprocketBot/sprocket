<script context="module" lang="ts">
	import { writable, get, type Writable } from 'svelte/store';
	import type { Player } from './models/Player';
	import type { DataObject } from './models/DataObject';
	import type { Role } from './models/Role';
	import type { Seat } from './models/Seat';

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
		{ id: 5, roleCategory: 'Player', name: 'Playing' },
		{ id: 6, roleCategory: 'Player', name: 'Non-Playing' }
	]);

	/*export const roleSeats = writable<Seat[]>([
		{ roleID: 1, minimumSeats: 1, maximumSeats: 1 },
		{ roleID: 2, minimumSeats: 1, maximumSeats: 1 },
		{ id: 3, roleCategory: 'Team', name: 'Assistant General Manager' },
		{ id: 4, roleCategory: 'Team', name: 'Captain' }
	]);*/

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
			roles: [addToRole(findItemInArray(1, roles), 1), addToRole(findItemInArray(5, roles), 1, 1)],
			league: findItemInArray(4, leagues),
			salary: 15.5
		},
		{
			id: 2,
			name: 'mattdamon',
			roles: [
				addToRole(findItemInArray(2, roles), 1, 1),
				addToRole(findItemInArray(5, roles), 1, 1)
			],
			league: findItemInArray(3, leagues),
			salary: 13
		},
		{
			id: 3,
			name: 'copex',
			roles: [
				addToRole(findItemInArray(3, roles), 1, 1),
				addToRole(findItemInArray(6, roles), 1, 1)
			],
			league: findItemInArray(4, leagues),
			salary: 16
		},
		{
			id: 4,
			name: 'gogurt',
			roles: [
				addToRole(findItemInArray(3, roles), 1, 1),
				addToRole(findItemInArray(6, roles), 1, 1)
			],
			league: findItemInArray(3, leagues),
			salary: 13
		},
		{
			id: 5,
			name: 'fatality',
			roles: [
				addToRole(findItemInArray(4, roles), 1, 1),
				addToRole(findItemInArray(5, roles), 1, 1)
			],
			league: findItemInArray(4, leagues),
			salary: 16.5
		},
		{
			id: 6,
			name: 'hobo',
			roles: [
				addToRole(findItemInArray(4, roles), 1, 1),
				addToRole(findItemInArray(5, roles), 1, 1)
			],
			league: findItemInArray(4, leagues),
			salary: 14.5
		},
		{
			id: 7,
			name: 'massimo',
			roles: [
				addToRole(findItemInArray(4, roles), 1, 1),
				addToRole(findItemInArray(5, roles), 1, 1)
			],
			league: findItemInArray(5, leagues),
			salary: 20
		},
		{
			id: 8,
			name: 'ouiiid',
			roles: [
				addToRole(findItemInArray(4, roles), 1, 1),
				addToRole(findItemInArray(5, roles), 1, 1)
			],
			league: findItemInArray(2, leagues),
			salary: 11
		}
	]);
	function findItemInArray<T extends DataObject>(id: number, array: Writable<T[]>): T {
		let object: T | undefined;
		object = get(array).find((item) => item.id === id);
		if (object === undefined || object === null) {
			throw new TypeError('This value was promised to be there.');
		}
		return object;
	}
	function addToRole(role: Role, franchiseID?: number, gameID?: number): Role {
		role.franchiseAssociationID = franchiseID;
		role.gameAssociationID = gameID;
		return role;
	}
</script>
