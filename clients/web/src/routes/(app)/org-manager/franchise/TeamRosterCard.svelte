<script lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import { roles } from '$lib/store/MockDataService.svelte';
	import type { Seat } from '$lib/store/models/Seat';
	import AssignmentCard from './AssignmentCard.svelte';

	export let league: DataObject;
	export let selectedFranchise: DataObject;
	export let selectedGame: DataObject;

	function getTemplateSeat(): Seat {
		let role = $roles.find((role) => role.roleCategory == 'Player');
		if (role == undefined) role = { id: 0, name: '', roleCategory: '' };
		return {
			id: 0,
			roleID: role.id,
			gameID: selectedGame.id,
			leagueID: league.id
		};
	}
</script>

<section>
	<AssignmentCard
		templateSeat={getTemplateSeat()}
		{selectedFranchise}
		sectionText={league.name}
		addText="Offer"
		removeText="Release"
		descriptivePlayerTextEntry={true}
	/>
</section>
