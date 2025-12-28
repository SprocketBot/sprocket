<script lang="ts">
	import { graphql } from '$houdini';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';

	const getMyApiTokens = graphql(`
		query GetMyApiTokens {
			getMyApiTokens {
				id
				name
				tokenPrefix
				createdAt
				lastUsedAt
				isRevoked
			}
		}
	`);

	const getAvailableScopes = graphql(`
		query GetAvailableScopes {
			getAvailableScopes
		}
	`);

	const generateApiToken = graphql(`
		mutation GenerateApiToken($name: String!, $scopes: [String!]!) {
			generateApiToken(name: $name, scopes: $scopes) {
				secret
				name
				scopes
				createdAt
			}
		}
	`);

	const revokeApiToken = graphql(`
		mutation RevokeApiToken($tokenId: String!) {
			revokeApiToken(tokenId: $tokenId)
		}
	`);

	let tokens = [];
	let availableScopes = [];
	let isCreateOpen = false;
	let newTokenName = '';
	let selectedScopes: string[] = [];
	let newlyCreatedToken: string | null = null;
	let newlyCreatedTokenName: string | null = null;

	$: if ($getMyApiTokens.data) {
		tokens = $getMyApiTokens.data.getMyApiTokens;
	}

	$: if ($getAvailableScopes.data) {
		availableScopes = $getAvailableScopes.data.getAvailableScopes;
	}

	onMount(() => {
		getMyApiTokens.fetch();
		getAvailableScopes.fetch();
	});

	async function handleRevoke(id: string) {
		if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.'))
			return;

		try {
			await revokeApiToken.mutate({ tokenId: id });
			alert('Token revoked successfully');
			getMyApiTokens.fetch();
		} catch (e) {
			alert('Failed to revoke token');
			console.error(e);
		}
	}

	function toggleScope(scope: string) {
		if (selectedScopes.includes(scope)) {
			selectedScopes = selectedScopes.filter((s) => s !== scope);
		} else {
			selectedScopes = [...selectedScopes, scope];
		}
	}

	function toggleAllScopes() {
		if (selectedScopes.length === availableScopes.length) {
			selectedScopes = [];
		} else {
			selectedScopes = [...availableScopes];
		}
	}

	async function handleCreate() {
		if (!newTokenName) {
			alert('Please enter a token name');
			return;
		}
		if (selectedScopes.length === 0) {
			alert('Please select at least one scope');
			return;
		}

		try {
			const result = await generateApiToken.mutate({
				name: newTokenName,
				scopes: selectedScopes
			});

			if (result.data?.generateApiToken) {
				newlyCreatedToken = result.data.generateApiToken.secret;
				newlyCreatedTokenName = result.data.generateApiToken.name;
				isCreateOpen = false;
				newTaskReset();
				getMyApiTokens.fetch();
			}
		} catch (e) {
			alert('Failed to create token');
			console.error(e);
		}
	}

	function newTaskReset() {
		newTokenName = '';
		selectedScopes = [];
		// Keep isCreateOpen handled by logic
	}
</script>

<div class="container mx-auto py-10">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">API Tokens</h1>
		<Button
			on:click={() => {
				isCreateOpen = true;
				newlyCreatedToken = null;
			}}>Generare New Token</Button
		>
	</div>

	{#if newlyCreatedToken}
		<Card.Root class="mb-8 border-green-500 bg-green-50 dark:bg-green-900/20">
			<Card.Header>
				<Card.Title class="text-green-700 dark:text-green-400"
					>Token Generated Successfully</Card.Title
				>
				<Card.Description>
					Make sure to copy your new API token now. You won't be able to see it again!
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center space-x-2">
					<code
						class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold w-full break-all"
					>
						{newlyCreatedToken}
					</code>
					<Button
						variant="outline"
						size="sm"
						on:click={() => {
							navigator.clipboard.writeText(newlyCreatedToken);
							alert('Copied to clipboard');
						}}>Copy</Button
					>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Prefix</Table.Head>
						<Table.Head>Created</Table.Head>
						<Table.Head>Last Used</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if tokens.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="text-center text-muted-foreground py-8"
								>No API tokens found.</Table.Cell
							>
						</Table.Row>
					{:else}
						{#each tokens as token (token.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{token.name}</Table.Cell>
								<Table.Cell class="font-mono text-xs">{token.tokenPrefix}</Table.Cell>
								<Table.Cell>{new Date(token.createdAt).toLocaleDateString()}</Table.Cell>
								<Table.Cell>
									{token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleString() : 'Never'}
								</Table.Cell>
								<Table.Cell>
									{#if token.isRevoked}
										<span
											class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"
											>Revoked</span
										>
									{:else}
										<span
											class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
											>Active</span
										>
									{/if}
								</Table.Cell>
								<Table.Cell>
									{#if !token.isRevoked}
										<Button variant="destructive" size="sm" on:click={() => handleRevoke(token.id)}
											>Revoke</Button
										>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<Dialog.Root bind:open={isCreateOpen}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>Generate New API Token</Dialog.Title>
				<Dialog.Description>
					Create a new API token to access the Sprocket API programmatically.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label htmlFor="name">Token Name</Label>
					<Input id="name" bind:value={newTokenName} placeholder="e.g. CI/CD Pipeline" />
				</div>
				<div class="grid gap-2">
					<Label>Scopes</Label>
					<div class="flex items-center space-x-2 mb-2">
						<Button variant="outline" size="xs" on:click={toggleAllScopes}>
							{selectedScopes.length === availableScopes.length ? 'Deselect All' : 'Select All'}
						</Button>
					</div>
					<div class="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
						{#each availableScopes as scope}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={scope}
									checked={selectedScopes.includes(scope)}
									onCheckedChange={() => toggleScope(scope)}
								/>
								<Label htmlFor={scope} class="text-sm font-normal cursor-pointer">{scope}</Label>
							</div>
						{/each}
						{#if availableScopes.length === 0}
							<p class="text-sm text-muted-foreground">No scopes available for this user.</p>
						{/if}
					</div>
					<p class="text-xs text-muted-foreground">
						Select the permissions this token should have.
					</p>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" on:click={() => (isCreateOpen = false)}>Cancel</Button>
				<Button on:click={handleCreate}>Generate Token</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
