<script lang="ts">
	import { PendingScrimHydrationStore, CurrentScrimHydrationStore, cache } from '$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$houdini';
	import ScrimFlow from './ScrimFlow.svelte';
	import ScrimList from './ScrimList.svelte';
	import { Warning } from '@steeze-ui/phosphor-icons';
	import DashboardSection from '$lib/components/DashboardSection.svelte';

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

{#if !$ScrimPageRoot.data}
	Loading...
{:else if !$ScrimPageRoot.data.whoami.players.length}
	<DashboardSection title="" size="fill">
		<section class="flex gap-8 items-center">
			<Icon src={Warning} class="w-16 text-primary-500" />
			<div>
				<p class="text-xl font-bold">
					You are not registered as a player for any games, and cannot scrim.
				</p>
				<p>If you believe this is in error, please contact your organization staff</p>
			</div>
		</section>
	</DashboardSection>
{:else if $ScrimPageRoot.data?.currentScrim}
	<!-- User is currently in a scrim -->
	<ScrimFlow
		pendingScrims={$ScrimPageRoot.data.pendingScrims}
		currentScrim={$ScrimPageRoot.data.currentScrim}
	/>
{:else}
	<ScrimList pendingScrims={$ScrimPageRoot.data?.pendingScrims ?? []} />
	<!-- User is not in a scrim -->
{/if}
