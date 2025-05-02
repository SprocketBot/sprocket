<script lang="ts">
	import type { Player } from '$lib/store/models/Player';
	import type { Role } from '$lib/store/models/Role';
	import { players } from '$lib/store/MockDataService.svelte';

	export let role;

	function onClickAction(player: Player, role?: Role) {
		player.roles?.forEach((item: Role, index: number) => {
			if (item === role) player.roles?.splice(index, 1);
		});
		$players = $players;
		console.log(player);
	}
</script>

<section>
	<h2><b>{role.name}</b></h2>
	{#each $players as player}
		<li>
			{#if player.roles?.includes(role)}
				{player.name}
				<button class="btn variant-soft-primary btn-sm" on:click={() => onClickAction(player, role)}
					>Dismiss</button
				>
			{/if}
		</li>
	{/each}
	<br />
</section>
