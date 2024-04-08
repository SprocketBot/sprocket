<script lang="ts">
	import { PendingScrimHydrationStore, CurrentScrimHydrationStore, cache } from '$houdini';
	import type { PageData } from './$houdini';
	import ScrimFlow from './ScrimFlow.svelte';
	import ScrimList from './ScrimList.svelte';

	export let data: PageData;
	$: ({ ScrimPageRoot } = data);

	const pendingScrimsHydration = new PendingScrimHydrationStore();
	pendingScrimsHydration.listen();
	$: if ($pendingScrimsHydration.data) {
		const scrimCache = cache.get('Scrim', $pendingScrimsHydration.data.live);
		if (scrimCache && $pendingScrimsHydration.data.live.complete) {
			cache.list('ScrimPage_PendingScrims').remove(scrimCache);
		} else {
			cache.list('ScrimPage_PendingScrims').append(scrimCache);
		}
	}
	new CurrentScrimHydrationStore().listen();
</script>

{#if $ScrimPageRoot.data?.currentScrim}
	<!-- User is currently in a scrim -->
	<ScrimFlow
		pendingScrims={$ScrimPageRoot.data.pendingScrims}
		currentScrim={$ScrimPageRoot.data.currentScrim}
	/>
{:else}
	<ScrimList pendingScrims={$ScrimPageRoot.data?.pendingScrims ?? []} />
	<!-- User is not in a scrim -->
{/if}
