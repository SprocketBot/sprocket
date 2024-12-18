<script lang="ts">
	import { can } from '$lib/auth';
	import { apiUrl } from '$lib/constants';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
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
</script>

<button class="btn btn-icon" use:popup={menuPopup}>
	<Icon src={List} class="h-6"></Icon>
</button>

<div data-popup="app-menu" class="p-0 bg-surface-300-600-token">
	<div class="btn-group-vertical">
		<a href="/settings" class="!m-0 !p-0 w-full">
			<button class="w-full">Settings</button>
		</a>
		{#if can('ViewGraphQLPlayground')}
			<a href="{apiUrl}/graphql" class="!m-0 !p-0"><button>GQL Playground</button></a>
		{/if}
		<a href="/logout" class="!m-0 !p-0 w-full" target="_self">
			<button class="variant-glass-error w-full"> Log Out </button>
		</a>
	</div>
</div>
