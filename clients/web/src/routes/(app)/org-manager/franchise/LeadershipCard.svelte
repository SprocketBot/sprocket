<script lang="ts">
	import type { Player } from '$lib/store/models/Player';
	import type { Role } from '$lib/store/models/Role';
	import { players, roleSeats, roleAssignments } from '$lib/store/MockDataService.svelte';
	import type { Assignment } from '$lib/store/models/Assignment';
	import type { Seat } from '$lib/store/models/Seat';
	import type { DataObject } from '$lib/store/models/DataObject';
	import AssignmentCard from './AssignmentCard.svelte';

	export let role: Role;
	export let selectedFranchise: DataObject;

	let staffRoleAssignmentsCount = findRoleAssignments(role).length;
	let seatCount = findRoleSeats(role).length;
	let searchString = '';

	function appointUserToStaff(searchUser: string, role: Role) {
		let newStaff = $players.find((player) => player.name == searchUser);
		let seatsForRole = $roleSeats.filter((seat) => seat.roleID === role.id);
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
	function findRoleAssignments(role: Role): Assignment[] {
		let roleAssignments: Assignment[] = [];
		$roleAssignments.filter((assignment) => {
			findRoleSeats(role).find((seat) => {
				if (seat.id == assignment.seatID && assignment.franchiseID == selectedFranchise.id) {
					roleAssignments.push(assignment);
				}
			});
		});
		return roleAssignments;
	}

	function findRoleSeats(role: Role): Seat[] {
		return $roleSeats.filter((seat) => seat.roleID == role.id);
	}
</script>

<section>
	<h2><b>{role.name}</b></h2>
	{#each $roleAssignments as assignment}
		{#each $roleSeats as seat}
			{#if seat.roleID == role.id && assignment.seatID == seat.id}
				{#each $players as player}
					<li>
						{#if player.id === assignment.playerID}
							<AssignmentCard
								{selectedFranchise}
								{seat}
								{player}
								textEntry={player.name + ' - ' + player.salary}
								buttonText="Dismiss"
							/>
						{/if}
					</li>
				{/each}
			{/if}
		{/each}
	{/each}
	{#if staffRoleAssignmentsCount < seatCount}
		<input bind:value={searchString} />
		<button on:click={() => appointUserToStaff(searchString, role)}>Appoint</button>
	{/if}
	<br />
</section>
