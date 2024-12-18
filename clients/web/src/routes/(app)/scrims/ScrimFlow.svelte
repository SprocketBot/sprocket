<script lang="ts">
	import {
		ScrimFlow_FragmentStore,
		type ScrimFlow_Fragment,
		ScrimState,
		type ScrimList_Fragment,
		LeaveScrimStore
	} from '$houdini';
	import { tweened } from 'svelte/motion';
	import ScrimFlowScrimListItem from './ScrimFlowScrimListItem.svelte';
	import { ArrowBendUpLeft, Hourglass } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import Countdown from '$lib/components/Countdown.svelte';
	import ScrimFlowHeader from './ScrimFlowHeader.svelte';
	import ResponsiveButton from '$lib/components/ResponsiveButton.svelte';

	export let currentScrim: ScrimFlow_Fragment;
	export let pendingScrims: ScrimList_Fragment[];

	const LeaveScrim = new LeaveScrimStore();

	const scrim = new ScrimFlow_FragmentStore().get(currentScrim);

	const fillProgressState = tweened();
	$: $fillProgressState =
		typeof $scrim?.participantCount !== 'undefined'
			? ($scrim?.participantCount / $scrim.gameMode.playerCount) * 100
			: 0;
</script>

<section class="card p-4 col-span-1 sm:col-span-4 md:col-span-8 lg:col-span-8">
	{#if $scrim}
		<ScrimFlowHeader scrim={$scrim} />
		{#if $scrim.state === ScrimState.PENDING}
			<section class="flex flex-col gap-4">
				<div class="flex w-full justify-between items-center">
					<div class="flex flex-col">
						<p class="font-bold text-sm uppercase">Game</p>
						<p>{$scrim.game.name}</p>
					</div>
					<div class="flex flex-col">
						<p class="font-bold text-sm uppercase">Game Mode</p>
						<p>{$scrim.gameMode.name}</p>
					</div>
					<div class="flex flex-col">
						<p class="font-bold text-sm uppercase">Skill Group</p>
						<p>{$scrim.skillGroup.name}</p>
					</div>
					<div class="flex gap-4 h-fit">
						<div class="flex items-center gap-1 px-2 badge badge-glass">
							{#if $scrim.pendingTtl}
								<Icon src={Hourglass} class="w-3" />
								<Countdown remainingTime={$scrim.pendingTtl / 1000} />
							{/if}
						</div>
						<!-- TODO: Confirm with user before leaving -->
						<ResponsiveButton
							src={ArrowBendUpLeft}
							class="variant-soft-error"
							on:click={() => LeaveScrim.mutate(null)}
						>
							Leave Scrim
						</ResponsiveButton>
					</div>
				</div>

				<div class="relative w-full h-6 bg-surface-500">
					<span
						class="absolute top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-surface-900"
						style="left: {$fillProgressState}%">{$scrim.participantCount} / 4</span
					>
					<div class="h-full bg-primary-500" style="width: {$fillProgressState}%" />
				</div>
			</section>
		{/if}
	{/if}
</section>

<section class="card col-span-1 sm:col-span-4 md:col-span-8 lg:col-span-4 p-4">
	<p class="font-bold text-center text-lg">Other Scrims</p>

	<ul>
		{#each Array.isArray(pendingScrims) ? (pendingScrims ?? []) : [] as pend}
			{#if pend.id !== $scrim?.id}
				<li class="odd:bg-surface-50/10 px-4 py-2">
					<ScrimFlowScrimListItem pendingScrim={pend} />
				</li>
			{/if}
		{/each}
	</ul>
</section>
