<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ GetFranchise } = data);
</script>

<div class="p-8">
	{#if $GetFranchise.fetching}
		<p>Loading...</p>
	{:else if $GetFranchise.errors}
		<p class="text-error-500">Error: {$GetFranchise.errors.map((e) => e.message).join(', ')}</p>
	{:else if $GetFranchise.data?.franchise}
		{@const franchise = $GetFranchise.data.franchise}
		<div class="flex justify-between items-start mb-6">
			<div>
				<h1 class="h1 flex items-center gap-4">
					{#if franchise.logoUrl}
						<img src={franchise.logoUrl} alt={franchise.name} class="w-12 h-12 object-contain" />
					{/if}
					{franchise.name}
				</h1>
				<p class="h3 opacity-70">{franchise.slug}</p>
			</div>
			<!-- Actions like Edit/Delete could go here -->
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Info Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Details</h2>
				<dl class="space-y-2">
					<div class="flex justify-between">
						<dt class="font-bold">Description:</dt>
						<dd>{franchise.description || 'N/A'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="font-bold">Primary Color:</dt>
						<dd>
							{#if franchise.primaryColor}
								<span
									class="px-2 py-0.5 rounded text-white"
									style="background-color: {franchise.primaryColor}">{franchise.primaryColor}</span
								>
							{:else}
								N/A
							{/if}
						</dd>
					</div>
					<div class="flex justify-between">
						<dt class="font-bold">Status:</dt>
						<dd>{franchise.isActive ? 'Active' : 'Inactive'}</dd>
					</div>
				</dl>
			</section>

			<!-- Roles Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Management Roles</h2>
				{#if franchise.roles.length === 0}
					<p class="opacity-50">No roles assigned.</p>
				{:else}
					<ul class="list-disc list-inside">
						{#each franchise.roles as role}
							<li>{role.user.username} - {role.roleType}</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- Clubs Card -->
			<section class="card p-4 col-span-1 lg:col-span-2">
				<h2 class="h2 mb-4">Clubs</h2>
				{#if franchise.clubs.length === 0}
					<p class="opacity-50">No clubs in this franchise.</p>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each franchise.clubs as club}
							<div class="card p-4 variant-soft-surface">
								<h3 class="h3">{club.name}</h3>
								<p class="text-sm opacity-70">Game: {club.game.name}</p>
								<p class="text-sm opacity-70">Slug: {club.slug}</p>
								<div class="mt-2 text-right">
									<a href="/org-manager/clubs/{club.id}" class="btn btn-sm variant-filled-primary"
										>Manage</a
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{:else}
		<p>Franchise not found.</p>
	{/if}
</div>
