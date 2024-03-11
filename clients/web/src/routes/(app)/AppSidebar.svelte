<script lang="ts">
	import { canView } from '$lib/auth';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { AuthTarget } from '@sprocketbot/lib/types';
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
		{#if canView(AuthTarget.VIEW_ROLE_CONFIG)}
			<AppRailAnchor href="/config/roles" selected={$page.url.pathname === '/config/roles'}>
				<div class="flex flex-col items-center justify-center gap-2">
					<Icon src={Users} class="w-4" />
					Manage Roles
				</div>
			</AppRailAnchor>
		{/if}
	</svelte:fragment>
</AppRail>
