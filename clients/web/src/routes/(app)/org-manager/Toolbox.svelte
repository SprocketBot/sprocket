<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { House, User, Users, GameController, Calendar } from '@steeze-ui/phosphor-icons';
	import { page } from '$app/stores';

	const routes = [
		{ url: '/org-manager', name: 'Dashboard', icon: House },
		{ url: '/org-manager/users', name: 'Manage Users', icon: Users },
		{ url: '/org-manager/roles', name: 'Manage Roles', icon: Users },
		{ url: '/org-manager/scrims', name: 'Manage Scrims', icon: GameController },
		{ url: '/org-manager/schedule', name: 'Manage Schedule', icon: Calendar },
	]


</script>

<div class="flex flex-col gap-2">
	{#each routes as route}
		<a href={route.url} class="contents">
			<button
				class="btn btn-sm flex justify-between gap-2 items-center"
				class:variant-soft-primary={$page.url.pathname === route.url}
				class:variant-soft-surface={$page.url.pathname !== route.url}
			>
				<Icon src={route.icon} class="h-4 w-auto" />
				{route.name}
			</button>
		</a>
	{/each}
</div>
