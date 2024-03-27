<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql, type UserSearch$input } from '$houdini';
	import debounce from 'debounce';

	let term = '';

	const userSearch = graphql(`
		query UserSearch($term: String!) {
			userSearch(term: $term) {
				id
				username
				active
			}
		}
	`);

	const update = debounce((vars: UserSearch$input) => {
		userSearch.fetch({ variables: vars });
	});

	$: browser && update({ term });

	const toggleActive = graphql(`
		mutation ToggleActiveUser($userId: String!, $active: Boolean!) {
			alterUserActiveStatus(userId: $userId, active: $active) {
				id
				username
				active
			}
		}
	`);
</script>

<h2 class="text-lg font-bold">User Manager</h2>

<label class="label flex gap-4 items-center mb-4">
	<input bind:value={term} class="flex-shrink input px-2 py-1" placeholder="User Search" />
</label>

<table class="table table-hover table-compact">
	<thead>
		<tr>
			<th class="!p-2">Username</th>
			<th class="!p-2">Actions</th>
		</tr>
	</thead>
	<tbody>
		{#each $userSearch?.data?.userSearch ?? [] as user}
			<tr>
				<td>
					{user.username}
				</td>
				<td>
					<!-- <input type="checkbox" disabled checked={user.active} /> -->
					<button
						class="btn btn-sm"
						class:variant-ghost-success={!user.active}
						class:variant-ghost-error={user.active}
						on:click={() => {
							toggleActive.mutate({
								userId: user.id,
								active: !user.active
							});
						}}
					>
						{user.active ? 'Deactivate' : 'Activate'}
					</button>
				</td>
			</tr>
		{/each}
	</tbody>
	<tfoot></tfoot>
</table>
