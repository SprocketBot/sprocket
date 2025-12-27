<script lang="ts">
	import { query, graphql } from '$houdini';

	const auditQuery = graphql(`
		query GetAuditLogs {
			permissionAuditLogs {
				id
				actorId
				action
				timestamp
				reason
			}
		}
	`);

	$: ({ data } = query(auditQuery));
</script>

<div class="container mx-auto p-4 space-y-4">
	<h1 class="h1">RBAC Audit Logs</h1>

	{#if $auditQuery.fetching}
		<p>Loading...</p>
	{:else if $data}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Timestamp</th>
						<th>Action</th>
						<th>Actor ID</th>
						<th>Reason</th>
					</tr>
				</thead>
				<tbody>
					{#each $data.permissionAuditLogs as log}
						<tr>
							<td>{new Date(log.timestamp).toLocaleString()}</td>
							<td><span class="badge variant-filled-secondary">{log.action}</span></td>
							<td>{log.actorId || 'System'}</td>
							<td>{log.reason || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
