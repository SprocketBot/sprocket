<script lang="ts">
	import { ArrowLeft } from '@steeze-ui/phosphor-icons';
	import type { PageData } from './$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import ProfileManager from './ProfileManager.svelte';
	import PlayerBox from './PlayerBox.svelte';
	import UserAccountsCard from './UserAccountsCard.svelte';

	export let data: PageData;

	$: ({ UserManager } = data);
</script>

<section class="col-span-1 sm:col-span-4 md:col-span-8 row-span-2 card p-4">
	{#if $UserManager.fetching || $UserManager.data === null}
		<div class="flex justify-center items-center h-full w-full">Loading...</div>
	{:else if !$UserManager?.data?.users.length}
		<div class="flex justify-center items-center h-full w-full">User not found!</div>
	{:else}
		{@const user = $UserManager.data.users[0]}
		<header class="w-full flex justify-between">
			<h2 class="text-lg font-bold">Editing {user.username}</h2>
			<a href="/org-manager/users">
				<button class="btn btn-icon btn-icon-sm variant-soft-surface">
					<Icon src={ArrowLeft} class="w-4" />
				</button>
			</a>
		</header>

		<section>
			<ProfileManager userData={user} />
		</section>

		<section>
			{#if $UserManager?.data !== null}
				{#each $UserManager.data?.games ?? [] as game}
					<PlayerBox gameData={game} userData={user} />
				{/each}
			{/if}
		</section>
	{/if}
</section>

{#if $UserManager.data?.users[0]}
	<UserAccountsCard accts={$UserManager.data?.users[0]} />
{/if}
