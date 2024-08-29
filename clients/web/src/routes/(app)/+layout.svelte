<script lang="ts">
	import { AppBar, AppShell, Avatar } from '@skeletonlabs/skeleton';
	import AppMenu from './AppMenu.svelte';
	import type { LayoutData } from './$types';
	import { setUserContext } from '$lib/auth';
	import AppSidebar from './AppSidebar.svelte';

	export let data: LayoutData;

	setUserContext(data.user);
</script>

<AppShell class="h-full">
	<AppBar
		gridColumns="grid-cols-3"
		slotDefault="place-self-center"
		slotTrail="place-content-end"
		slot="header"
		padding="px-8 py-2"
	>
		<a href="/" slot="lead"><img src="/img/wordmark.svg" alt="Sprocket Logo" class="h-8" /></a>
		<svelte:fragment slot="trail">
			<span class="font-bold">{data.user.username}</span>
			<Avatar initials={data.user.username.substring(0, 2)} src={data.user.avatarUrl} width="w-8"/>
			<AppMenu />
		</svelte:fragment>
	</AppBar>

	<AppSidebar slot="sidebarLeft" />

	<section
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-12 py-8 grid-flow-dense h-max"
	>
		<slot />
	</section>
</AppShell>
