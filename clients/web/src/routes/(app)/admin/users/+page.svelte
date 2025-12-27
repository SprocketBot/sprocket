<script lang="ts">
	import { query, graphql } from '$houdini';

	const dataQuery = graphql(`
		query UserAssignmentData($term: String! = "") {
			users(query: { username: { term: $term, fuzzy: true } }) {
				id
				username
			}
			roles {
				id
				name
				displayName
			}
		}
	`);

	const assignRoleMutation = graphql(`
		mutation AssignRole($userId: Int!, $role: String!, $scope: String) {
			assignRoleToUser(userId: $userId, role: $role, scope: $scope) {
				id
				status
			}
		}
	`);

	let searchTerm = '';
	// Debounce search? For now, simple binding or button.
	// Houdini query variables are reactive.
	$: ({ data } = query(dataQuery, { variables: { term: searchTerm } }));

	let selectedRole = '';
	let scope = '';

	async function handleAssign(userId: number) {
		if (!selectedRole) {
			alert('Please select a role first');
			return;
		}
		try {
			await assignRoleMutation.mutate({
				userId: userId,
				role: selectedRole,
				scope: scope || undefined
			});
			alert('Role assigned!');
		} catch (e) {
			console.error(e);
			alert('Failed to assign role');
		}
	}
</script>

<div class="container mx-auto p-4 space-y-4">
	<h1 class="h1">User Role Assignments</h1>

	<!-- Controls -->
	<div class="card p-4 space-y-4">
		<label class="label">
			<span>Search Users</span>
			<input
				class="input"
				type="text"
				bind:value={searchTerm}
				placeholder="Search by username..."
			/>
		</label>

		<div class="flex gap-4">
			<label class="label flex-1">
				<span>Role to Assign</span>
				<select class="select" bind:value={selectedRole}>
					<option value="">Select Role...</option>
					{#if $data}
						{#each $data.roles as role}
							<option value={role.name}>{role.displayName}</option>
						{/each}
					{/if}
				</select>
			</label>
			<label class="label flex-1">
				<span>Scope (Optional)</span>
				<input class="input" type="text" bind:value={scope} placeholder="e.g. 101" />
			</label>
		</div>
	</div>

	<!-- Results Table -->
	{#if $dataQuery.fetching}
		<p>Loading...</p>
	{:else if $data && $data.users}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>ID</th>
						<th>Username</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each $data.users as user}
						<tr>
							<td>{user.id}</td>
							<td>{user.username}</td>
							<td>
								<button
									class="btn btn-sm variant-filled-primary"
									on:click={() => handleAssign(Number(user.id))}
								>
									Assign Selected Role
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p>No users found.</p>
	{/if}
</div>
