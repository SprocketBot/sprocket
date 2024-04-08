<script lang="ts">
	import {
		ManageScrim_FragmentStore,
		type ManageScrim_Fragment,
		DestroyScrimStore
	} from '$houdini';
	import { Minus, Plus, Trash } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { slide } from 'svelte/transition';
	import capitalize from 'lodash.capitalize';
	import ResponsiveButton from '$lib/components/ResponsiveButton.svelte';

	export let scrimData: ManageScrim_Fragment;

	const scrim = new ManageScrim_FragmentStore().get(scrimData);
	const destroyScrim = new DestroyScrimStore();

	let showParticipants = false;
</script>

<div class="contents">
	<p>{$scrim?.skillGroup.name}</p>
	<p>
		{$scrim?.createdAt.toLocaleDateString()}
		{$scrim?.createdAt.toLocaleTimeString()}
	</p>
	<p>{capitalize($scrim?.state)}</p>
	<p class="flex items-center gap-4">
		{$scrim?.participants?.length} Participant
		<ResponsiveButton
			src={showParticipants ? Minus : Plus}
			class="variant-glass-surface"
			on:click={() => (showParticipants = !showParticipants)}
		>
			{showParticipants ? 'Hide' : 'Show'}
		</ResponsiveButton>
	</p>
	<div class="flex justify-end">
		<!-- Actions -->
		<ResponsiveButton
			src={Trash}
			class="variant-soft-error"
			on:click={() => $scrim && destroyScrim.mutate({ scrimId: $scrim.id })}
		>
			Cancel Scrim
		</ResponsiveButton>
	</div>
</div>

{#if showParticipants && $scrim?.participants?.length}
	<div class="bg-surface-900 px-4 py-2 mt-2 contents" transition:slide>
		{#each $scrim.participants as participant}
			<!-- TODO: Make these fields copyable-->
			<div
				class="py-1 bg-surface-900 w-full h-full col-span-1 font-mono text-sm flex justify-center items-center"
			>
				<p>{participant.name}</p>
			</div>
			<div
				class="py-1 bg-surface-900 w-full h-full col-span-4 font-mono text-sm flex justify-center items-center"
			>
				<p>{participant.id}</p>
			</div>
		{/each}
	</div>
{/if}
