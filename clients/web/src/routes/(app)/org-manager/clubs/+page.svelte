<script lang="ts">
	import type { PageData } from './$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Pencil } from '@steeze-ui/phosphor-icons';

	export let data: PageData;
	$: ({ GetClubs } = data);
</script>

<div class="p-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Club Management</h1>
	</div>

	{#if $GetClubs.fetching}
		<p>Loading...</p>
	{:else if $GetClubs.errors}
		<p class="text-error-500">Error: {$GetClubs.errors.map((e) => e.message).join(', ')}</p>
	{:else}
		<div class="space-y-8">
			{#each $GetClubs.data?.franchises ?? [] as franchise}
				{#if franchise.clubs.length > 0}
					<section class="card p-4">
						<h2 class="h2 mb-4">{franchise.name} Clubs</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each franchise.clubs as club}
								<a
									href="/org-manager/clubs/{club.id}"
									class="card p-4 variant-soft-surface hover:variant-filled-surface transition-colors flex items-center justify-between"
								>
									<div>
										<h3 class="h3">{club.name}</h3>
										<p class="text-sm opacity-70">{club.game.name} | {club.slug}</p>
									</div>
									<Icon src={Pencil} class="w-5 h-5 opacity-50" />
								</a>
							{/each}
						</div>
					</section>
				{/if}
			{/each}
		</div>
	{/if}
</div>
