<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { House, User, Users, GameController } from '@steeze-ui/phosphor-icons';
	import { page } from '$app/stores';
</script>

<div class="flex flex-col gap-2">
	<a href="/org-manager" class="contents">
		<button
			class="btn btn-sm flex justify-between gap-2 items-center"
			class:variant-soft-primary={$page.url.pathname === '/org-manager'}
			class:variant-soft-surface={$page.url.pathname !== '/org-manager'}
		>
			<Icon src={House} class="h-4 w-auto" />
			Dashboard
		</button>
	</a>
	<a href="/org-manager/users" class="contents">
		<button
			class="btn btn-sm flex justify-between gap-2 items-center"
			class:variant-soft-primary={$page.url.pathname === '/org-manager/users'}
			class:variant-soft-surface={$page.url.pathname !== '/org-manager/users'}
		>
			<Icon src={User} class="h-4 w-auto" />
			Manage Users
		</button>
	</a>
	<a href="/org-manager/roles" class="contents">
		<button
			class="btn variant-soft-primary btn-sm flex justify-between gap-2 items-center"
			class:variant-soft-primary={$page.url.pathname === '/org-manager/roles'}
			class:variant-soft-surface={$page.url.pathname !== '/org-manager/roles'}
		>
			<Icon src={Users} class="h-4 w-auto" />
			Manage Roles
		</button>
	</a>
	<a href="/org-manager/scrims" class="contents">
		<button
			class="btn variant-soft-primary btn-sm flex justify-between gap-2 items-center"
			class:variant-soft-primary={$page.url.pathname === '/org-manager/scrims'}
			class:variant-soft-surface={$page.url.pathname !== '/org-manager/scrims'}
		>
			<Icon src={GameController} class="h-4 w-auto" />
			Manage Scrims
		</button>
	</a>
</div>
