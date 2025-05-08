<script lang="ts">
	import type { Seat } from '$lib/store/models/Seat';
	import AssignmentEntry from './AssignmentEntry.svelte';
	import { players, roleAssignments, roleSeats } from '$lib/store/MockDataService.svelte';
	import type { Assignment } from '$lib/store/models/Assignment';
	import type { DataObject } from '$lib/store/models/DataObject';
	import type { Player } from '$lib/store/models/Player';

	export let templateSeat: Seat;
	export let selectedFranchise: DataObject;
	export let sectionText: string;
	export let addText: string;
	export let removeText: string;
	export let descriptivePlayerTextEntry: boolean;

	let searchString = '';

	function appointUserToSeat(searchUser: string) {
		let newStaff = $players.find((player) => player.name == searchUser);
		let seatsForRole = findRoleSeats();
		let availableSeats: Seat[] = [];
		for (var seat of seatsForRole) {
			let found = false;
			for (var assignment of $roleAssignments) {
				if (assignment.seatID == seat.id) {
					found = true;
				}
			}
			if (!found) availableSeats.push(seat);
		}
		if (availableSeats != undefined && newStaff != undefined) {
			let newAssignment: Assignment = {
				id: 0,
				playerID: newStaff?.id,
				seatID: availableSeats[0].id,
				franchiseID: selectedFranchise.id
			};

			$roleAssignments.push(newAssignment);
			$roleAssignments = $roleAssignments;
			searchString = '';
		}
	}

	function findRoleAssignments(): Assignment[] {
		let roleAssignments: Assignment[] = [];
		$roleAssignments.filter((assignment) => {
			findRoleSeats().find((seat) => {
				if (
					seat.id == assignment.seatID &&
					assignment.franchiseID == selectedFranchise.id &&
					seat.leagueID == templateSeat.leagueID
				) {
					roleAssignments.push(assignment);
				}
			});
		});
		return roleAssignments;
	}

	function findRoleSeats(): Seat[] {
		return $roleSeats.filter(
			(seat) =>
				seat.roleID == templateSeat.roleID &&
				seat.gameID == templateSeat.gameID &&
				seat.leagueID == templateSeat.leagueID
		);
	}

	function getTextEntry(player: Player): string {
		if (descriptivePlayerTextEntry) return player.name + ' - ' + player.salary;
		else return player.name;
	}
</script>

<section>
	<h2><b>{sectionText}</b></h2>
	{#each $roleAssignments as assignment}
		{#each $roleSeats as seat}
			{#if seat.roleID == templateSeat.roleID && seat.leagueID == templateSeat.leagueID && assignment.seatID == seat.id}
				{#each $players as player}
					<li>
						{#if player.id === assignment.playerID}
							<AssignmentEntry
								{selectedFranchise}
								{seat}
								{player}
								textEntry={getTextEntry(player)}
								{removeText}
							/>
						{/if}
					</li>
				{/each}
			{/if}
		{/each}
	{/each}
	{#if findRoleAssignments().length < findRoleSeats().length}
		<input bind:value={searchString} />
		<button on:click={() => appointUserToSeat(searchString)}>{addText}</button>
	{/if}
	<br />
</section>
