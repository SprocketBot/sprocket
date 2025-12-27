<script lang="ts">
	import { query, graphql } from '$houdini';

	// Define Query
	const rolesQuery = graphql(`
		query GetRoles {
			roles {
				id
				name
				displayName
				hierarchy
				isRestricted
				isActive
			}
		}
	`);

	$: ({ data } = query(rolesQuery));
</script>

<div class="container mx-auto p-4 space-y-4">
	<div class="flex justify-between items-center">
		<h1 class="h1">Role Management</h1>
		<a href="/admin/roles/new" class="btn variant-filled-primary">Create Role</a>
	</div>

	{#if $rolesQuery.fetching}
		<p>Loading...</p>
	{:else if $rolesQuery.errors}
		<p class="text-error-500">Error: {$rolesQuery.errors.map((e) => e.message).join(', ')}</p>
	{:else if $data}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Display Name</th>
						<th>Name</th>
						<th>Hierarchy</th>
						<th>Restricted</th>
						<th>Active</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each $data.roles as role}
						<tr>
							<td>{role.displayName}</td>
							<td>{role.name}</td>
							<td>{role.hierarchy}</td>
							<td>{role.isRestricted ? 'Yes' : 'No'}</td>
							<td>{role.isActive ? 'Yes' : 'No'}</td>
							<td>
								<a href={`/admin/roles/${role.name}`} class="btn btn-sm variant-filled-secondary"
									>Edit</a
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
