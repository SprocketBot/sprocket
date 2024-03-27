<script lang="ts">
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import LoginButtons from '../LoginButtons.svelte';

	// TODO: Account linking?
	const toast = getToastStore();
	const modalStore = getModalStore();

	const linkedCallback = (e: MessageEvent<'logged-in' | { status: string; message: string }>) => {
		modalStore.close();
		if (e.data === 'logged-in') {
			toast.trigger({
				timeout: 2000,
				autohide: true,
				message: 'Account Linked!',
				background: 'variant-filled-success'
			});
		} else {
			const { status = 'warning', message = 'Login Failed' } = e.data;
			toast.trigger({
				timeout: 2000,
				autohide: true,
				message,
				background: `variant-filled-${status}`
			});
		}
	};
</script>

<div class="card px-4 py-2 pb-6 w-modal">
	<header class="text-2xl font-bold text-center mb-4">Link a new Account</header>

	<LoginButtons callback={linkedCallback} />
</div>
