<script lang="ts">
	import { Fragment_UserAccountsStore, type Fragment_UserAccounts } from '$houdini';
	import { platformIconMap } from '$lib/platformIconMap';
	import { Icon } from '@steeze-ui/svelte-icon';

	export let accts: Fragment_UserAccounts;
	const accounts = new Fragment_UserAccountsStore().get(accts);
</script>

<ul class="grid grid-cols-[auto,auto,auto,1fr] gap-x-4 gap-y-2 items-center justify-center">
	<li class="contents">
		<span />
		<span />
		<span class="font-bold">Name</span>
		<span class="font-bold">Platform ID</span>
	</li>

	{#if $accounts}
		{#each $accounts.accounts ?? [] as account}
			<li class="contents text-sm">
                <!-- 
                    TODO: Make this clickable to make it bigger 
                    that should probably be it's own component
                 -->
                <img src={account.avatarUrl} alt="Avatar" class="w-8 h-8 rounded-full" />
				<Icon src={platformIconMap[account.platform]} class="w-4" />
				<span>{account.platformName}</span>
				<span class="truncate">{account.platformId}</span>
			</li>
		{/each}
	{/if}
</ul>
