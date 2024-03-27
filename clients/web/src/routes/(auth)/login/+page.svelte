<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';

	import LoginButtons from '../LoginButtons.svelte';

	const toast = getToastStore();

	const authedCallback = (e: MessageEvent<'logged-in' | { status: string; message: string }>) => {
		if (e.data === 'logged-in') {
			toast.trigger({
				timeout: 2000,
				autohide: true,
				message: 'Logged In!',
				background: 'variant-filled-success'
			});
			goto('/');
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

<h1 class="font-bold text-center text-4xl mb-8">Login With:</h1>

<LoginButtons callback={authedCallback} />
