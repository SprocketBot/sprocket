<script lang="ts">
	import { ManageScrimsHydrationStore, cache } from '$houdini';
	import type { PageData } from './$houdini';
	import ManageScrimRow from './ManageScrimRow.svelte';
	import groupBy from 'lodash.groupby';
	import DashboardSection from '$lib/components/DashboardSection.svelte';

	export let data: PageData;

	$: ({ ScrimManagementPage } = data);

	$: groupedScrims = groupBy($ScrimManagementPage?.data?.allScrims ?? [], (s) => s.game.name);
	const manageScrimsHydrator = new ManageScrimsHydrationStore();
	manageScrimsHydrator.listen();
	$: if ($manageScrimsHydrator.data) {
		const scrimCache = cache.get('Scrim', $manageScrimsHydrator.data.live);
		const listCache = cache.list('AllScrims_ManagementList')
		console.log({ scrimCache, $manageScrimsHydrator, listCache });
		if (scrimCache && $manageScrimsHydrator.data.live.complete) {
			// Remove from cache
			listCache.remove(scrimCache);
		} else {
			// Append to cache
			listCache.append(scrimCache);
		}
		// Update now that cache is changed. 
		groupedScrims = groupBy($ScrimManagementPage?.data?.allScrims ?? [], (s) => s.game.name)
	}
</script>

<DashboardSection title="Scrim Manager" size="large">
	{#each Object.entries(groupedScrims) as [game, scrimDatum]}
		<h3 class="font-bold mb-2">{game} scrims</h3>
		<div
			class="grid grid-cols-[auto,auto,auto,auto,auto] w-full justify-items-center place-items-center"
		>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center">
				<p>Skill Group</p>
			</div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center">
				<p>Created At</p>
			</div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center">
				<p>State</p>
			</div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center">
				<p>Participants</p>
			</div>
			<div class="mb-2 py-1 w-full h-full bg-surface-700 flex justify-center items-center">
				<p></p>
			</div>
			{#each scrimDatum as scrimData}
				<ManageScrimRow {scrimData} />
			{/each}
		</div>
	{:else}
		No Scrims Active
	{/each}
</DashboardSection>
