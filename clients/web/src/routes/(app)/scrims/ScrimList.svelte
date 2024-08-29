<script lang="ts">
	import type { ScrimList_Fragment } from '$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import ScrimListItem from './ScrimListItem.svelte';
	import { Plus } from '@steeze-ui/phosphor-icons';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import ScrimCreateModal from './ScrimCreateModal.svelte';

	export let pendingScrims: ScrimList_Fragment[];

	const modalStore = getModalStore();

</script>

<section class="card col-span-1 sm:col-span-4 md:col-span-6 lg:col-span-8 p-4">
	<header class="flex justify-between items-center">
		<p class="font-bold text-lg">Available Scrims</p>
		<button
			on:click={() =>
				modalStore.trigger({ type: 'component', component: { ref: ScrimCreateModal } })}
			class="btn btn-sm variant-filled-primary flex gap-2 items-center"
		>
			<Icon src={Plus} class="w-4" />
			Create Scrim
		</button>
	</header>
	{#each pendingScrims ?? [] as scrim}
		<ScrimListItem pendingScrim={scrim} />
	{:else}
		There are currently no active scrims
	{/each}
</section>
<!-- <section class="card col-span-1 sm:col-span-4 md:col-span-2 lg:col-span-4 p-4"></section> -->
