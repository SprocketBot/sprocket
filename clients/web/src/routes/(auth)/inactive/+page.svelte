<script lang="ts">
	import type { PageData } from './$houdini';
	import { platformIconMap } from '../../../lib/platformIconMap';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import AccountLinkModal from './AccountLinkModal.svelte';

	export let data: PageData;

	const modalStore = getModalStore();
	const openAccountLinkModal = () => {
		modalStore.trigger({
			type: 'component',
			title: 'account-link-modal',
			component: { ref: AccountLinkModal }
		});

		const unsub = modalStore.subscribe((v) => {
			if (!v.length || !v.find((m) => m.title === 'account-link-modal')) {
				unsub();
				CurrentUser.fetch({
					policy: 'NetworkOnly' // Force a network refetch
				});
			}
		});
	};

	$: ({ CurrentUser } = data);
</script>

<h1 class="text-center text-2xl font-bold mb-6">Your account is inactive</h1>

<section class="text-center">
	<p>You are signed in as: {$CurrentUser?.data?.whoami.username}</p>

	<p>Please reach out to league officials for more information.</p>

	<hr class="w-2/3 mx-auto my-4" />
</section>

<section class="text-center">
	<h2>
		<p class="font-bold text-xl">In the meantime,</p>
		<p class="text-base font-semibold">please make sure all of your accounts are reported</p>
	</h2>

	<p>Currently Reported Accounts:</p>
	<ul class="grid grid-cols-[min-content,auto,auto] text-left gap-x-2 gap-y-2">
		<li class="contents font-bold">
			<span />
			<span>Platform</span>
			<span>Account Name</span>
		</li>
		{#each $CurrentUser?.data?.whoami?.accounts ?? [] as account}
			<li class="contents">
				<Icon class="w-6" src={platformIconMap[account.platform]} />
				<span>{account.platform}</span>
				<span>{account.platformName}</span>
			</li>
		{/each}
		<li class="col-span-3 flex justify-center items-center pt-4">
			<button on:click={openAccountLinkModal} class="btn btn-md variant-filled-primary">
				Add New Account
			</button>
		</li>
	</ul>
</section>
