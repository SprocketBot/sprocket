<script lang="ts">
	import type { PageData } from './$houdini';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Pencil } from '@steeze-ui/phosphor-icons';

	export let data: PageData;
	$: ({ GetFranchises } = data);
</script>

<div class="p-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Franchise Management</h1>
	</div>

	{#if $GetFranchises.fetching}
		<p>Loading...</p>
	{:else if $GetFranchises.error}
		<p class="text-error-500">Error: {$GetFranchises.error.message}</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each $GetFranchises.data?.franchises ?? [] as franchise}
				<a
					href="/org-manager/franchises/{franchise.id}"
					class="card p-4 variant-soft-surface hover:variant-filled-surface transition-colors flex items-center justify-between"
				>
					<div class="flex items-center gap-4">
						{#if franchise.logoUrl}
							<img src={franchise.logoUrl} alt={franchise.name} class="w-10 h-10 object-contain" />
						{:else}
							<div class="w-10 h-10 bg-surface-500/20 rounded flex items-center justify-center">
								<span class="text-xl font-bold">{franchise.name.charAt(0)}</span>
							</div>
						{/if}
						<div>
							<h3 class="h3">{franchise.name}</h3>
							<p class="text-sm opacity-70">Slug: {franchise.slug}</p>
						</div>
					</div>
					<Icon src={Pencil} class="w-5 h-5 opacity-50" />
				</a>
			{/each}
		</div>
	{/if}
</div>
