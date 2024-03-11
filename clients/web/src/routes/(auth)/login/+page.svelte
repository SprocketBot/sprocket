<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Discord, Microsoft, Steam, Xbox, Playstation, Epicgames } from '@steeze-ui/simple-icons';
	import { getToastStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { oauthPopup } from './oauthPopup';
	import { goto } from '$app/navigation';
	import { apiUrl } from '$lib/constants';

	const comingSoon: PopupSettings = {
		event: 'hover',
		target: 'accountProviderComingSoonPopup'
	};
	const toast = getToastStore();

	const authedCallback = (e: MessageEvent<string>) => {
		if (e.data === 'logged-in') {
			toast.trigger({
				timeout: 2000,
				autohide: true,
				message: 'Logged In!',
				background: 'variant-filled-success'
			});
			goto('/');
		}
	};
</script>

<h1 class="font-bold text-center text-4xl mb-8">Login With:</h1>

<div class="grid grid-cols-2 gap-4">
	<button
		class="variant-ringed btn btn-lg"
		type="button"
		use:oauthPopup={{
			windowUrl: `${apiUrl}/oauth/callback/discord`,
			callback: authedCallback
		}}
	>
		<span><Icon src={Discord} class="h-6" /></span>
		<span>Discord</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={Steam} class="h-6" /></span>
		<span>Steam</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={Xbox} class="h-6" /></span>
		<span>Xbox</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={Microsoft} class="h-6" /></span>
		<span>Microsoft</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={Playstation} class="h-6" /></span>
		<span>Playstation</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={Epicgames} class="h-6" /></span>
		<span>Epic</span>
	</button>
</div>

<div class="card p-2 text-sm variant-filled-error" data-popup="accountProviderComingSoonPopup">
	<p>This account provider is coming soon!</p>
	<div class="arrow variant-filled-error" />
</div>
