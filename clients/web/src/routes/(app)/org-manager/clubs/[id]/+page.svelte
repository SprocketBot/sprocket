<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ClubProfile } = data);
</script>

<div class="p-8">
	{#if $ClubProfile.fetching}
		<p>Loading...</p>
	{:else if $ClubProfile.errors}
		<p class="text-error-500">Error: {$ClubProfile.errors.map((e) => e.message).join(', ')}</p>
	{:else if $ClubProfile.data?.club}
		{@const club = $ClubProfile.data.club}
		<div class="flex justify-between items-start mb-6">
			<div>
				<h1 class="h1">{club.name}</h1>
				<p class="h3 opacity-70">
					<a href="/org-manager/franchises/{club.franchise.id}" class="hover:underline"
						>{club.franchise.name}</a
					>
					> {club.name}
				</p>
				<p class="text-sm opacity-70">{club.game.name} | {club.slug}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Info Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Details</h2>
				<dl class="space-y-2">
					<div class="flex justify-between">
						<dt class="font-bold">Status:</dt>
						<dd>{club.isActive ? 'Active' : 'Inactive'}</dd>
					</div>
				</dl>
			</section>

			<!-- Roles Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Club Roles</h2>
				{#if club.roles.length === 0}
					<p class="opacity-50">No roles assigned.</p>
				{:else}
					<ul class="list-disc list-inside">
						{#each club.roles as role}
							<li>{role.user.username} - {role.roleType}</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- Teams Card -->
			<section class="card p-4 col-span-1 lg:col-span-2">
				<h2 class="h2 mb-4">Teams</h2>
				{#if club.teams.length === 0}
					<p class="opacity-50">No teams in this club.</p>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each club.teams as team}
							<div class="card p-4 variant-soft-surface">
								<h3 class="h3">{team.name}</h3>
								<p class="text-sm opacity-70">Skill Group: {team.skillGroup.name}</p>
								<div class="mt-2 text-right">
									<a href="/org-manager/teams/{team.id}" class="btn btn-sm variant-filled-primary"
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
		<p>Club not found.</p>
	{/if}
</div>
