<script lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import type { Player } from '$lib/store/models/Player';
	import { players, roleAssignments, roleSeats, roles } from '$lib/store/MockDataService.svelte';
	import type { Seat } from '$lib/store/models/Seat';
	import type { Assignment } from '$lib/store/models/Assignment';
	import AssignmentCard from './AssignmentCard.svelte';

	export let league: DataObject;
	export let selectedFranchise: DataObject;
	let textEntry: string;

	let staffRoleAssignmentsCount = findRoleAssignments(league).length;
	let seatCount = findRoleSeats(league).length;

	let searchString = '';

	function addUserToRoster(searchUser: string, league: DataObject) {
		let newStaff = $players.find((player) => player.name == searchUser);
		let seatsForRole = $roleSeats.filter((seat) => seat.roleID === 5); //TODO
		let availableSeats: Seat[] = [];
		for (var seat of seatsForRole) {
			let found = false;
			for (var assignment of $roleAssignments) {
				if (assignment.seatID == seat.id && league.id == seat.leagueID) {
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

	function findRoleAssignments(league: DataObject): Assignment[] {
		let roleAssignments: Assignment[] = [];
		$roleAssignments.filter((assignment) => {
			findRoleSeats(league).find((seat) => {
				if (
					seat.id == assignment.seatID &&
					assignment.franchiseID == selectedFranchise.id &&
					seat.leagueID == league.id
				) {
					roleAssignments.push(assignment);
				}
			});
		});
		return roleAssignments;
	}

	function findRoleSeats(league: DataObject): Seat[] {
		return $roleSeats.filter((seat) => seat.leagueID == league.id);
	}
</script>

<section>
	<h2><b>{league.name}</b></h2>
	{#each $roleAssignments as assignment}
		{#if assignment.franchiseID == selectedFranchise.id}
			{#each $roleSeats as seat}
				{#if assignment.seatID == seat.id && seat.leagueID == league.id}
					{#each $players as player}
						<li>
							{#if player.id === assignment.playerID}
								<AssignmentCard
									{selectedFranchise}
									{seat}
									{player}
									textEntry={player.name + ' - ' + player.salary}
									buttonText="Release"
								/>
							{/if}
						</li>
					{/each}
				{/if}
			{/each}
		{/if}
	{/each}
	{#if staffRoleAssignmentsCount < seatCount}
		<input bind:value={searchString} />
		<button on:click={() => addUserToRoster(searchString, league)}>Offer</button>
	{/if}
</section>
