<script lang="ts">
	import { can } from '$lib/auth';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';

	import { GameController, Users } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';

	import { page } from '$app/stores';
</script>

<AppRail class="h-full" slot="sidebarLeft">
	<AppRailAnchor href="/scrims" selected={$page.url.pathname === '/scrims'}>
		<div class="flex flex-col items-center justify-center gap-2">
			<Icon src={GameController} class="w-4" />
			Scrims
		</div>
	</AppRailAnchor>

	<svelte:fragment slot="trail">
		{#if can("ViewPermissionManager")}
			<AppRailAnchor href="/org-manager" selected={$page.url.pathname.startsWith('/org-manager')}>
				<div class="flex flex-col items-center justify-center gap-2">
					<Icon src={Users} class="w-4" />
					Org Manager
				</div>
			</AppRailAnchor>
		{/if}
	</svelte:fragment>
</AppRail>
