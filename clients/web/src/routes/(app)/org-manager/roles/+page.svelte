<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ RolesList } = data);
</script>

<section class="col-span-1 sm:col-span-4 md:col-span-8 row-span-2 card p-4">
	<h2 class="text-lg font-bold mb-4">Role Manager</h2>

	<table class="table table-hover table-compact">
		<thead>
			<tr>
				<th>Name</th>
				<th>Display Name</th>
				<th>Description</th>
				<th>Hierarchy</th>
			</tr>
		</thead>
		<tbody>
			{#each $RolesList.data?.roles ?? [] as role}
				<tr>
					<td>{role.name}</td>
					<td>{role.displayName}</td>
					<td>{role.description ?? ''}</td>
					<td>{role.hierarchy}</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4">
                        {#if $RolesList.isFetching}
                            Loading...
                        {:else}
                            No Roles Found
                        {/if}
                    </td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>