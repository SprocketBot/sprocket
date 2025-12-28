<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ GetSeasons } = data);
</script>

<div class="p-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="h1">Season Management</h1>
	</div>

	{#if $GetSeasons.fetching}
		<p>Loading...</p>
	{:else if $GetSeasons.error}
		<p class="text-error-500">Error: {$GetSeasons.error.message}</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each $GetSeasons.data?.seasons ?? [] as season}
				<div class="card p-4 variant-soft-surface">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h3 class="h3">{season.name}</h3>
						</div>
						<span
							class="badge {season.isActive ? 'variant-filled-success' : 'variant-filled-surface'}"
						>
							{season.isActive ? 'Active' : 'Inactive'}
						</span>
					</div>
					<div class="text-sm">
						<p>Start: {new Date(season.startDate).toLocaleDateString()}</p>
						{#if season.endDate}
							<p>End: {new Date(season.endDate).toLocaleDateString()}</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="col-span-full opacity-50">No seasons found.</div>
			{/each}
		</div>
	{/if}
</div>
