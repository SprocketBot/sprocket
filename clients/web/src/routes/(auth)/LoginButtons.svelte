<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Discord, Steam, Playstation, Epicgames } from '@steeze-ui/simple-icons';
	import { GameController, WindowsLogo } from '@steeze-ui/phosphor-icons';
	import { oauthPopup } from './oauthPopup';
	import { apiUrl } from '$lib/constants';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	const comingSoon: PopupSettings = {
		event: 'hover',
		target: 'accountProviderComingSoonPopup'
	};

	export let callback: (
		e: MessageEvent<'logged-in' | { status: string; message: string }>
	) => unknown;
</script>

<div class="grid grid-cols-2 gap-4">
	<button
		class="variant-ringed btn btn-lg"
		type="button"
		use:oauthPopup={{
			windowUrl: `${apiUrl}/oauth/callback/discord`,
			callback
		}}
	>
		<span><Icon src={Discord} class="h-6" /></span>
		<span>Discord</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		use:oauthPopup={{
			windowUrl: `${apiUrl}/oauth/callback/steam`,
			callback
		}}
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
		<span><Icon src={GameController} class="h-6" /></span>
		<span>Xbox</span>
	</button>
	<button
		class="variant-ringed btn btn-lg [&>*]:pointer-events-none"
		type="button"
		disabled
		use:popup={comingSoon}
	>
		<span><Icon src={WindowsLogo} class="h-6" /></span>
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
