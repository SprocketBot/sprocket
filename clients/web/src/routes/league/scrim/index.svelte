<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, Spinner
	} from "$lib/components";
	import {
		LFSScrimsStore, type LFSScrim
	} from "$lib/api";

	const store = new LFSScrimsStore();
	let fetching = true;
	let scrims: LFSScrim[] | undefined = [];

	$: {
		// @ts-expect-error `fetching` exists on the query store but isn't defined in the type
	    fetching = $store.fetching;
		scrims = $store.data?.LFSScrims;
	}
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="LFS (Team) Scrims">
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else if scrims}
			{#each scrims as scrim (scrim.id)}
				<h2 class="text-2xl text-accent font-bold mb-8">{scrim.id}</h2>
			{/each}
		{:else}
			<div class="h-full w-full flex items-center justify-center">
				No scrims found
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>
