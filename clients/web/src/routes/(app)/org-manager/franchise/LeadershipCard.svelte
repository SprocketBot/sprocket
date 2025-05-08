<script lang="ts">
	import type { Role } from '$lib/store/models/Role';
	import type { Seat } from '$lib/store/models/Seat';
	import type { DataObject } from '$lib/store/models/DataObject';
	import AssignmentCard from './AssignmentCard.svelte';

	export let role: Role;
	export let selectedFranchise: DataObject;
	export let selectedGame: DataObject;

	function getTemplateSeat(): Seat {
		return {
			id: 0,
			roleID: role.id,
			gameID: selectedGame.id
		};
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
