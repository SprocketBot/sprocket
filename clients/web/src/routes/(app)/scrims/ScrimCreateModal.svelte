<script lang="ts">
	import {
		CreateScrimDataStore,
		type CreateScrimData$result,
		CreateScrimMutationStore
	} from '$houdini';

	export let parent: { onClose: CallableFunction };

	const onSubmit = async () => {
		if (!game || !gameMode) return;
		await createScrimMutation.mutate({
			payload: {
				gameId: game.id,
				gameModeId: gameMode.id,
				options: {
					pendingTimeout: pendingTimeout
				}
			}
		});

		parent.onClose();
	};

	onMount(() => {
		game = undefined;
		gameMode = undefined;
	});

	const createScrimData = new CreateScrimDataStore();
	createScrimData.fetch();
	const createScrimMutation = new CreateScrimMutationStore();

	let game: undefined | CreateScrimData$result['whoami']['players'][number]['game'];
	let gameMode:
		| undefined
		| CreateScrimData$result['whoami']['players'][number]['game']['gameModes'][number];
	let pendingTimeout: number | undefined;
</script>

<section class="w-modal card px-8 py-4">
	<header>
		<p class="text-lg font-bold">Create new scrim</p>
	</header>

	{#if $createScrimData.fetching}
		Loading...
	{:else if $createScrimData.data}
		<form on:submit|preventDefault={onSubmit} class="flex flex-col gap-2">
			<label class="label">
				Game
				<select class="select text-sm border-none" bind:value={game}>
					<option disabled>...</option>
					{#each $createScrimData.data.whoami.players as { game }}
						<option value={game}>{game.name}</option>
					{/each}
				</select>
			</label>
			<label class="label">
				Game Mode
				<select class="select text-sm border-none" bind:value={gameMode} disabled={!game}>
					<option disabled>...</option>
					{#if game}
						{#each game.gameModes as mode}
							<option value={mode}>{mode.name}</option>
						{/each}
					{/if}
				</select>
			</label>

			<hr class="my-2" />
			<label class="label">
				How long until your scrim should close?
				<select class="select text-sm border-none" bind:value={pendingTimeout}>
					<option disabled>...</option>
					<option value={5 * 1000}>5 Seconds</option>
					<option value={5 * 60 * 1000}>5 Minutes</option>
					<option selected value={10 * 60 * 1000}>10 Minutes</option>
					<option value={20 * 60 * 1000}>20 Minutes</option>
					<option value={60 * 60 * 1000}>60 Minutes</option>
				</select>
			</label>
			<hr class="my-2" />
			<button class="btn variant-filled-success" disabled={!game || !gameMode}>
				Create Scrim
			</button>
		</form>
	{/if}
</section>
