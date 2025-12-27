<script lang="ts">
	import { page } from '$app/stores';
	import { query, graphql } from '$houdini';

	// Queries & Mutations
	const roleDetailQuery = graphql(`
		query GetRoleAndPermissions($name: String!) {
			role(name: $name) {
				id
				name
				displayName
				description
				hierarchy
				isRestricted
				isActive
			}
			rolePermissions(role: $name) {
				resource
				action
				scope
				effect
			}
		}
	`);

	const addPermissionMutation = graphql(`
		mutation AddPermission($role: String!, $resource: String!, $action: String!, $scope: String!) {
			addPermissionToRole(role: $role, resource: $resource, action: $action, scope: $scope)
		}
	`);

	const removePermissionMutation = graphql(`
		mutation RemovePermission(
			$role: String!
			$resource: String!
			$action: String!
			$scope: String!
		) {
			removePermissionFromRole(role: $role, resource: $resource, action: $action, scope: $scope)
		}
	`);

	// Reactive params
	$: roleName = $page.params.id;
	$: ({ data } = query(roleDetailQuery, { variables: { name: roleName } }));

	// Form State
	let newResource = '';
	let newAction = '';
	let newScope = 'all';

	async function handleAddPermission() {
		if (!newResource || !newAction) return;
		try {
			await addPermissionMutation.mutate({
				role: roleName,
				resource: newResource,
				action: newAction,
				scope: newScope
			});
			// Refresh? Houdini cache should handle it if setup correctly,
			// but explicit refetch might be needed if cache keys are tricky.
			// For now, simple reload or trust cache.
			// To be safe, we can refetch.
			// roleDetailQuery.fetch({ variables: { name: roleName } });

			// Reset form
			newResource = '';
			newAction = '';
			newScope = 'all';
		} catch (e) {
			console.error(e);
			alert('Failed to add permission');
		}
	}

	async function handleRemovePermission(p: any) {
		if (!confirm('Are you sure you want to remove this permission?')) return;
		try {
			await removePermissionMutation.mutate({
				role: roleName,
				resource: p.resource,
				action: p.action,
				scope: p.scope
			});
		} catch (e) {
			console.error(e);
			alert('Failed to remove permission');
		}
	}
</script>

<div class="container mx-auto p-4 space-y-8">
	<!-- Header / Breadcrumbs -->
	<div class="flex items-center gap-2 text-sm text-gray-500">
		<a href="/admin/roles" class="hover:underline">Roles</a>
		<span>/</span>
		<span>{roleName}</span>
	</div>

	{#if $roleDetailQuery.fetching}
		<p>Loading...</p>
	{:else if $data && $data.role}
		<!-- Role Metadata Card -->
		<div class="card p-4 space-y-4">
			<header class="card-header flex justify-between">
				<h2 class="h2">{$data.role.displayName}</h2>
				<span class="badge variant-filled-surface">Hierarchy: {$data.role.hierarchy}</span>
			</header>
			<section class="p-4">
				<p><strong>Name:</strong> {$data.role.name}</p>
				<p><strong>Description:</strong> {$data.role.description || 'N/A'}</p>
				<p><strong>Restricted:</strong> {$data.role.isRestricted ? 'Yes' : 'No'}</p>
			</section>
		</div>

		<!-- Permissions Section -->
		<div class="card p-4 space-y-4">
			<header class="card-header flex justify-between items-center">
				<h3 class="h3">Permissions</h3>
			</header>

			<!-- Add Permission Form -->
			<div class="flex gap-4 items-end p-4 bg-surface-100-800-token rounded-container-token">
				<label class="label">
					<span>Resource</span>
					<input class="input" type="text" bind:value={newResource} placeholder="e.g. roster" />
				</label>
				<label class="label">
					<span>Action</span>
					<input class="input" type="text" bind:value={newAction} placeholder="e.g. manage" />
				</label>
				<label class="label">
					<span>Scope</span>
					<input class="input" type="text" bind:value={newScope} placeholder="e.g. own_team" />
				</label>
				<button class="btn variant-filled-primary" on:click={handleAddPermission}>Add</button>
			</div>

			<!-- Permissions Table -->
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Resource</th>
							<th>Action</th>
							<th>Scope</th>
							<th>Effect</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each $data.rolePermissions as p}
							<tr>
								<td>{p.resource}</td>
								<td>{p.action}</td>
								<td><code class="code">{p.scope}</code></td>
								<td>{p.effect || 'allow'}</td>
								<td>
									<button
										class="btn btn-sm variant-filled-error"
										on:click={() => handleRemovePermission(p)}>Remove</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<p>Role not found.</p>
	{/if}
</div>
