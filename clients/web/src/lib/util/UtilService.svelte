<script context="module" lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import { get, type Writable } from 'svelte/store';

	export function findItemInArray<T extends DataObject>(id: number, array: Writable<T[]>): T {
		let object: T | undefined;
		object = get(array).find((item) => item.id === id);
		if (object === undefined || object === null) {
			throw new TypeError('This value was promised to be there.');
		}
		return object;
	}
</script>
