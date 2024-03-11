<script lang="ts">
	import { goto } from '$app/navigation';
	import { canView, getUserContext } from '$lib/auth';
	import { apiUrl } from '$lib/constants';
	import { getToastStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { AuthTarget } from '@sprocketbot/lib/types';
	import { List } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';

	const menuPopup: PopupSettings = {
		event: 'click',
		target: 'app-menu',
		placement: 'bottom-end',
		middleware: {
			offset: 8
		}
	};

	const toast = getToastStore();

	const user = getUserContext();
</script>

<button class="btn btn-icon" use:popup={menuPopup}>
	<Icon src={List} class="h-6"></Icon>
</button>

<div data-popup="app-menu" class="p-0 bg-surface-300-600-token">
	<div class="btn-group-vertical">
		<button disabled>Settings</button>
		{#if canView(AuthTarget.VIEW_GQL_PLAYGROUND)}
			<a href="{apiUrl}/graphql" class="!m-0 !p-0"><button>GQL Playground</button></a>
		{/if}
		<button
			class="variant-glass-error"
			on:click={async () => {
				const success = await fetch(`${apiUrl}/auth/logout`, { credentials: 'include' }).then((r) =>
					r.json()
				);
				if (success) {
					toast.trigger({
						message: 'Logged Out!',
						autohide: true,
						timeout: 2000,
						background: 'variant-filled-warning'
					});
					goto('/login');
				} else {
					toast.trigger({
						message: 'Error Logging Out!',
						autohide: true,
						timeout: 2000,
						background: 'variant-filled-error'
					});
				}
			}}>Sign Out</button
		>
	</div>
</div>
