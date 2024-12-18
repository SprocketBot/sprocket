<script context="module">
	const sizes = {
		fill: 'col-span-1 md:col-span-2 lg:col-span-3',
		large: 'col-span-1 md:col-span-2 lg:col-span-2',
		sm: 'col-span-1 md:col-span-1 lg:col-span-1'
	};
</script>

<script lang="ts">
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';

	import SubjectBox from './SubjectBox.svelte';

	export let title: string | undefined = undefined;
	export let size: keyof typeof sizes = 'sm';
	export let transparent: boolean = false;
	export let icon: IconSource | undefined = undefined;
	let _class: string = '';
	export { _class as class };
</script>

<section class:px-4={transparent} class="{sizes[size]} {_class}" class:-my-4={transparent}>
	{#if transparent}
		<slot />
	{:else}
		<SubjectBox grow>
			<h3 class="flex justify-center gap-2 items-center" slot="header">
				{#if icon}
					<Icon src={icon} class="h-6 w-auto" />
				{/if}
				{title}
			</h3>
			<slot />
		</SubjectBox>
	{/if}
</section>
