<script lang="ts">
	import type { Role } from '$lib/store/models/Role';
	import type { Seat } from '$lib/store/models/Seat';
	import type { DataObject } from '$lib/store/models/DataObject';
	import AssignmentCard from './AssignmentCard.svelte';

	export let role: Role;
	export let selectedFranchise: DataObject;
	export let selectedGame: DataObject = { id: 0, name: '' };

	function getTemplateSeat(): Seat {
		let templateSeatForFranchiseRoles = {
			id: 0,
			roleID: role.id
		};
		let templateSeatForTeamRoles = {
			id: 0,
			roleID: role.id,
			gameID: selectedGame.id
		};
		if (selectedGame.id == 0) return templateSeatForFranchiseRoles;
		else return templateSeatForTeamRoles;
	}
</script>

<section>
	<AssignmentCard
		templateSeat={getTemplateSeat()}
		{selectedFranchise}
		sectionText={role.name}
		addText="Appoint"
		removeText="Dismiss"
		descriptivePlayerTextEntry={false}
	/>
</section>
