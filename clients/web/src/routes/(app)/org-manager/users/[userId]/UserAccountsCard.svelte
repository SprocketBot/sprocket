<script lang="ts">
	import {
		Fragment_UserManagerAccountsStore,
		type Fragment_UserManagerAccounts
	} from '../../../../../../$houdini';
	import { platformIconMap } from '$lib/platformIconMap';
	import { Icon } from '@steeze-ui/svelte-icon';
	import SubjectBox from '$lib/components/SubjectBox.svelte';

	export let accts: Fragment_UserManagerAccounts;
	const accounts = new Fragment_UserManagerAccountsStore().get(accts);
</script>

<section class="col-span-1 sm:col-span-4 card p-4">
	<SubjectBox title="Reported User Accounts">
		<ul class="grid grid-cols-[auto,auto,auto] gap-4">
			<li class="contents">
				<span />
				<span class="font-bold">Name</span>
				<span class="font-bold">Platform ID</span>
			</li>

			{#if $accounts}
				{#each $accounts.accounts as account}
					<li class="contents text-sm">
						<Icon src={platformIconMap[account.platform]} class="w-4" />
						<span>{account.platformName}</span>
						<span class="truncate">{account.platformId}</span>
					</li>
				{/each}
			{/if}
		</ul>
	</SubjectBox>
</section>
