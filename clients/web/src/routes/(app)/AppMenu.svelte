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
		{#if canView(AuthTarget.GraphQLPlayground)}
			<a href="{apiUrl}/graphql" class="!m-0 !p-0"><button>GQL Playground</button></a>
		{/if}
		<a href="/logout" class="!m-0 !p-0" target="_self">
			<button class="variant-glass-error"> Log Out </button>
		</a>
	</div>
</div>
