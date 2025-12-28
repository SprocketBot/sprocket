<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ TeamProfile } = data);
</script>

<div class="p-8">
	{#if $TeamProfile.fetching}
		<p>Loading...</p>
	{:else if $TeamProfile.errors}
		<p class="text-error-500">Error: {$TeamProfile.errors.map((e) => e.message).join(', ')}</p>
	{:else if $TeamProfile.data?.team}
		{@const team = $TeamProfile.data.team}
		<div class="flex justify-between items-start mb-6">
			<div>
				<h1 class="h1">{team.name}</h1>
				<p class="h3 opacity-70">
					<a href="/org-manager/franchises/{team.club.franchise.id}" class="hover:underline"
						>{team.club.franchise.name}</a
					>
					> <a href="/org-manager/clubs/{team.club.id}" class="hover:underline">{team.club.name}</a>
					> {team.name}
				</p>
				<p class="text-sm opacity-70">{team.skillGroup.name} | {team.slug}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Info Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Details</h2>
				<dl class="space-y-2">
					<div class="flex justify-between">
						<dt class="font-bold">Status:</dt>
						<dd>{team.isActive ? 'Active' : 'Inactive'}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="font-bold">Roster Limit:</dt>
						<dd>{team.rosterSizeLimit}</dd>
					</div>
				</dl>
			</section>

			<!-- Roster Card -->
			<section class="card p-4 col-span-1 lg:col-span-2">
				<h2 class="h2 mb-4">Roster</h2>
				{#if team.rosterSpots.length === 0}
					<p class="opacity-50">No players on roster.</p>
				{:else}
					<table class="table table-compact w-full">
						<thead>
							<tr>
								<th>Player</th>
								<th>Status</th>
								<th>Joined</th>
							</tr>
						</thead>
						<tbody>
							{#each team.rosterSpots as spot}
								<tr>
									<td>{spot.player.user.username}</td>
									<td>{spot.status}</td>
									<td>{new Date(spot.joinedAt).toLocaleDateString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</section>

			<!-- Roles Card -->
			<section class="card p-4">
				<h2 class="h2 mb-4">Team Roles</h2>
				{#if team.roles.length === 0}
					<p class="opacity-50">No roles assigned.</p>
				{:else}
					<ul class="list-disc list-inside">
						{#each team.roles as role}
							<li>{role.user.username} - {role.roleType}</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	{:else}
		<p>Team not found.</p>
	{/if}
</div>
