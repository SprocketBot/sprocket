<script lang="ts">
	import { ManageScrimsHydrationStore, cache } from '$houdini';
	import { onMount } from 'svelte';
	import type { PageData } from './$houdini';
	import ManageScrimRow from './ManageScrimRow.svelte';
	import groupBy from 'lodash.groupby';

	export let data: PageData;

	$: ({ ScrimManagementPage } = data);

	$: groupedScrims = groupBy($ScrimManagementPage?.data?.allScrims ?? [], (s) => s.game.name);
	const manageScrimsHydrator = new ManageScrimsHydrationStore();
	manageScrimsHydrator.listen();
	$: if ($manageScrimsHydrator.data) {
		const scrimCache = cache.get('Scrim', $manageScrimsHydrator.data.live);
		if (scrimCache && $manageScrimsHydrator.data.live.complete) {
			cache.list('AllScrims_ManagementList').remove(scrimCache);
		} else {
			cache.list('AllScrims_ManagementList').append(scrimCache);
		}
	}
</script>

<section class="col-span-1 sm:col-span-4 md:col-span-8 row-span-2 card p-4">
	<h2 class="text-lg font-bold mb-4">Scrim Manager</h2>

	{#each Object.entries(groupedScrims) as [game, scrimDatum]}
		<h3 class="font-bold mb-2">{game} scrims</h3>
		<div
			class="grid grid-cols-[auto,auto,auto,auto,auto] w-full justify-items-center place-items-center"
		>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center"><p>Skill Group</p></div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center"><p>Created At</p></div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center"><p>State</p></div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center"><p>Participants</p></div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center"><p></p></div>
			{#each scrimDatum as scrimData}
				<ManageScrimRow {scrimData} />
			{/each}
		</div>
	{:else}
		No Scrims Active
	{/each}
	<!-- {#each $ScrimManagementPage.data?.allScrims ?? [] as scrimData}{/each} -->
</section>
