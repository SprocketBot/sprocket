<script context="module" lang="ts">
	import { writable, get, type Writable } from 'svelte/store';
	import type { Player } from './Player';
	import type { Role } from './Role';
	import type { DataObject } from './DataObject';

	export const franchise = writable('Express');

	export const roles = writable<Role[]>([
		{ id: 1, roleCategory: 'Franchise', name: 'Franchise Manager' },
		{ id: 2, roleCategory: 'Team', name: 'General Manager' },
		{ id: 3, roleCategory: 'Team', name: 'Assistant General Manager' },
		{ id: 4, roleCategory: 'Team', name: 'Captain' }
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
			roles: [findItemInArray(1, roles)],
			league: findItemInArray(4, leagues),
			salary: 15.5
		},
		{
			id: 2,
			name: 'mattdamon',
			roles: [findItemInArray(2, roles)],
			league: findItemInArray(3, leagues),
			salary: 13
		},
		{
			id: 3,
			name: 'copex',
			roles: [findItemInArray(3, roles)],
			league: findItemInArray(4, leagues),
			salary: 16,
			playing: false
		},
		{
			id: 4,
			name: 'gogurt',
			roles: [findItemInArray(3, roles)],
			league: findItemInArray(3, leagues),
			salary: 13,
			playing: false
		},
		{
			id: 5,
			name: 'fatality',
			roles: [findItemInArray(4, roles)],
			league: findItemInArray(4, leagues),
			salary: 16.5
		},
		{
			id: 6,
			name: 'hobo',
			roles: [findItemInArray(4, roles)],
			league: findItemInArray(4, leagues),
			salary: 14.5
		},
		{
			id: 7,
			name: 'massimo',
			roles: [findItemInArray(4, roles)],
			league: findItemInArray(5, leagues),
			salary: 20
		},
		{
			id: 8,
			name: 'ouiiid',
			roles: [findItemInArray(4, roles)],
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
</script>
