<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql, type UserSearch$input } from '$houdini';
	import debounce from 'debounce';
	import { can, getUserContext } from '$lib/auth';
	import { Pencil, Users } from '@steeze-ui/phosphor-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { PageData } from './$houdini';
	import { onMount } from 'svelte';
	import DashboardSection from '$lib/components/DashboardSection.svelte';
	const currentUser = getUserContext();
	let term = '';

	export let data: PageData;

	$: ({ UserSearch } = data);
	
	const update = debounce((vars: UserSearch$input) => {
		UserSearch.fetch({ variables: vars });
	}, 500);

	onMount(() => update({ term }));

	$: if (browser) update({ term });

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
<DashboardSection title="User Manager" size="large" icon={Users}>
	<label class="label flex gap-4 items-center mb-2">
		<input
			bind:value={term}
			class="flex-shrink text-sm input px-2 py-1"
			placeholder="Search"
		/>
	</label>
	<table class="table table-hover table-compact">
		<thead>
			<tr>
				<th class="!p-2 w-3/5"> Username </th>
				<th class="!p-2 w-2/5"></th>
			</tr>
		</thead>
		<tbody>
			{#each $UserSearch.data?.users ?? [] as user}
				<tr>
					<td>
						{user.username}
					</td>
					<td>
						<div class="flex gap-2 justify-end">
							<!-- <input type="checkbox" disabled checked={user.active} /> -->
							<button
								disabled={user.id === currentUser.id}
								class="btn btn-sm"
								class:variant-soft-success={!user.active}
								class:variant-soft-error={user.active}
								on:click={() => {
									toggleActive.mutate({
										userId: user.id,
										active: !user.active
									});
								}}
							>
								{user.active ? 'Deactivate' : 'Activate'}
							</button>

							<a href="/org-manager/users/{user.id}" target="_self">
								<button
									class="btn btn-sm variant-soft-surface flex gap-2"
									disabled={!can('EditUserProfile') && !can('EditUserPlayers')}
								>
									<Icon src={Pencil} class="h-4 w-4" />
									Edit
								</button>
							</a>
						</div>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="2">
						{#if $UserSearch.data?.users.length === 0 && $UserSearch.variables?.term}
							No Players Found
						{:else}
							Please enter a search term
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot></tfoot>
	</table>
</DashboardSection>
