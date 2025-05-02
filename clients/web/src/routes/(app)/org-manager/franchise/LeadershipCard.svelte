<script lang="ts">
	import type { Player } from '$lib/store/models/Player';
	import type { Role } from '$lib/store/models/Role';
	import { players, roleSeats } from '$lib/store/MockDataService.svelte';

	export let role;
	let searchString = '';
	let staffCount = countStaffPositionInFranchise(role);
	let minSeatCount = $roleSeats.find((seat) => seat.roleID == role.id)?.minimumSeats ?? 0;
	let maxSeatCount = $roleSeats.find((seat) => seat.roleID == role.id)?.maximumSeats ?? 0;

	function onClickAction(player: Player, role: Role) {
		player.roles?.forEach((item: Role, index: number) => {
			if (item === role) player.roles?.splice(index, 1);
		});
		staffCount = countStaffPositionInFranchise(role);
		$players = $players;
	}

	function countStaffPositionInFranchise(staffRole: Role): number {
		let count = $players.filter((player) =>
			player.roles?.find((role) => role.id == staffRole.id)
		).length;
		return count;
	}

	function appointUserToStaff(searchUser: string, role: Role) {
		let newStaff = $players.find((player) => player.name == searchUser);
		if (newStaff != undefined) {
			newStaff.roles?.push(role);
		}
		$players = $players;
		staffCount = countStaffPositionInFranchise(role);
		searchString = '';
	}
</script>

<section>
	<h2><b>{role.name}</b></h2>
	{#each $players as player}
		<li>
			{#if player.roles?.includes(role)}
				{player.name}
				{#if staffCount > minSeatCount}
					<button
						class="btn variant-soft-primary btn-sm"
						on:click={() => onClickAction(player, role)}>Dismiss</button
					>
				{/if}
			{/if}
		</li>
	{/each}
	{#if staffCount < maxSeatCount}
		<input bind:value={searchString} />
		<button on:click={() => appointUserToStaff(searchString, role)}>Appoint</button>
	{/if}
	<br />
</section>
