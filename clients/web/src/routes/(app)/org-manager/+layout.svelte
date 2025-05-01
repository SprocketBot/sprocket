<script lang="ts">
	import { House, Toolbox, User, Users, GameController, UserList } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { page } from '$app/stores';
	import SubjectBox from '$lib/components/SubjectBox.svelte';
</script>

<slot />

<!-- The toolbox always appears and takes up the same space on the grid. -->
<div
	class=" card p-4 row-start-1
	lg:col-span-4 lg:col-start-9
	md:col-span-4 md:col-start-1
	sm:col-span-4 sm:col-start-1
	col-span-1 col-start-1
	"
>
	<SubjectBox title="">
		<h3 class="flex justify-center gap-2 items-center" slot="header">
			<Icon src={Toolbox} class="h-6 w-auto" /> Toolbox
		</h3>
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
			<a href="/org-manager/franchise" class="contents">
				<button
					class="btn variant-soft-primary btn-sm flex justify-between gap-2 items-center"
					class:variant-soft-primary={$page.url.pathname === '/org-manager/franchise'}
					class:variant-soft-surface={$page.url.pathname !== '/org-manager/franchise'}
				>
					<Icon src={UserList} class="h-4 w-auto" />
					Manage Franchise
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
	</SubjectBox>
</div>
