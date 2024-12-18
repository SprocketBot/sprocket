<script lang="ts">
	import { ArrowLeft } from '@steeze-ui/phosphor-icons';
	import type { PageData } from './$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import ProfileManager from './ProfileManager.svelte';
	import PlayerBox from './PlayerBox.svelte';
	import UserAccountsCard from './UserAccountsCard.svelte';
	import DashboardSection from '$lib/components/DashboardSection.svelte';

	export let data: PageData;

	$: ({ UserManager } = data);

	$: [user] = $UserManager?.data?.users ?? [];
</script>

<DashboardSection size="fill" transparent class="row-start-1 flex justify-between">
	{#if $UserManager.fetching || $UserManager.data === null}
		<div class="flex justify-center items-center w-full">Loading...</div>
	{:else if !$UserManager?.data?.users.length}
		<div class="flex justify-center items-center w-full">User not found!</div>
	{:else}
		{@const user = $UserManager.data.users[0]}
		<h2 class="text-lg font-bold">Editing "{user?.username ?? ''}"</h2>

		<a href="/org-manager/users">
			<button class="btn btn-icon btn-icon-sm variant-soft-surface">
				<Icon src={ArrowLeft} class="w-4" />
			</button>
		</a>
	{/if}
</DashboardSection>
<DashboardSection title="Profile">
	<ProfileManager userData={user} />
</DashboardSection>

<DashboardSection title="Players" size="large">
	{#if $UserManager?.data !== null}
		{#each $UserManager.data?.games ?? [] as game}
			<PlayerBox gameData={game} userData={user} />
		{/each}
	{/if}
</DashboardSection>
<UserAccountsCard size="large" accts={$UserManager.data?.users[0]} />
