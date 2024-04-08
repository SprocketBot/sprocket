<script lang="ts">
	import {
		type Fragment_PlayerManagerGames,
		type Fragment_PlayerManagerUsers,
		Fragment_PlayerManagerUsersStore,
		Fragment_PlayerManagerGamesStore,
		CreatePlayerStore,

		UpdatePlayerStore,

		DeletePlayerStore


	} from '$houdini';
	import SubjectBox from '$lib/components/SubjectBox.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let userData: Fragment_PlayerManagerUsers;
	export let gameData: Fragment_PlayerManagerGames;

	let game = new Fragment_PlayerManagerGamesStore().get(gameData);
	let user = new Fragment_PlayerManagerUsersStore().get(userData);
	const createPlayerStore = new CreatePlayerStore();
	const updatePlayerStore = new UpdatePlayerStore();
	const deletePlayerStore = new DeletePlayerStore();

	const toastStore = getToastStore();

	async function createPlayer() {
		if ($user === null || $game === null) {
			toastStore.trigger({
				message: 'Failed to create player!',
				classes: 'variant-filled-error',
				timeout: 2000
			});
			return;
		}
		await createPlayerStore.mutate({
			data: {
				userId: $user.id,
				gameId: $game.id,
				skillGroupId: selectedSkillGroupId
			},
			userId: $user.id
		});
		toastStore.trigger({
			message: 'Player Created!',
			classes: 'variant-soft-success',
			timeout: 2000
		})
	}
	async function updatePlayer() {
		if (!player) {
			toastStore.trigger({
				message: 'Failed to update player!',
				classes: 'variant-filled-error',
				timeout: 2000
			});
			return;
		}
		await updatePlayerStore.mutate({
			data: {
				playerId: player.id,
				destinationSkillGroupId: selectedSkillGroupId
			},
		});
		toastStore.trigger({
			message: 'Player Updated!',
			classes: 'variant-soft-success',
			timeout: 2000
		})
		console.log({
			player
		})
	}
	async function deletePlayer() {
		if (!player || !$user) {
			toastStore.trigger({
				message: 'Failed to delete player!',
				classes: 'variant-filled-error',
				timeout: 2000
			});
			return;
		}
		await deletePlayerStore.mutate({
			playerId: player.id,
			userId: $user.id
		})
		toastStore.trigger({
			message: 'Player Deleted!',
			classes: 'variant-soft-success',
			timeout: 2000
		})
		console.log({
			u: $user
		})

	}



	$: player = $user?.players.find((p) => p.game.id === $game?.id);

	let selectedSkillGroupId: string;

	onMount(() => {
		// Fragment data is guarunteed to exist here
		selectedSkillGroupId = player!.skillGroup.id;
	});
</script>

{#if $game !== null && $user !== null}
	<SubjectBox title="Player: {$game.name}">
		<p class:text-success-500={player} class:text-warning-500={!player}>
			{player ? 'Plays' : 'Does not play'}
		</p>
		<label class="label mb-2">
			<span
				class:font-bold={player?.skillGroup.id !== selectedSkillGroupId}
				class:text-warning-300={player?.skillGroup.id !== selectedSkillGroupId}
				class="text-sm">Skill Group</span
			>
			<select class="select text-sm border-none" bind:value={selectedSkillGroupId}>
				{#each $game.skillGroups as group}
					<option value={group.id}>({group.code}) {group.name}</option>
				{/each}
			</select>
		</label>
		<div class="flex justify-end gap-2">
			{#if $game !== null}
				{#if !$user.players.some((p) => $game && p.game.id === $game.id)}
					<button class="btn btn-sm variant-soft-surface" on:click={createPlayer}>
						Create Player
					</button>
				{:else}
					<button on:click={updatePlayer} class="btn btn-sm variant-soft-surface"> Update Player </button>
					<button on:click={deletePlayer} class="btn btn-sm variant-soft-error"> Delete Player </button>
				{/if}
			{/if}
		</div>
	</SubjectBox>
{/if}
