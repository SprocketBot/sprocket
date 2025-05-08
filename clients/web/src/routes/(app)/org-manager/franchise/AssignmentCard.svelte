<script lang="ts">
	import type { DataObject } from '$lib/store/models/DataObject';
	import type { Player } from '$lib/store/models/Player';
	import { roleAssignments } from '$lib/store/MockDataService.svelte';
	import type { Seat } from '$lib/store/models/Seat';

	export let selectedFranchise: DataObject;
	export let seat: Seat;
	export let player: Player;
	export let textEntry: string;
	export let buttonText: string;

	function onRemoveAssignment(player: Player) {
		$roleAssignments?.splice(
			$roleAssignments.findIndex(
				(assignment) =>
					assignment.franchiseID == selectedFranchise.id &&
					assignment.playerID == player.id &&
					assignment.seatID == seat?.id
			),
			1
		);
		console.log(player, $roleAssignments);
		$roleAssignments = $roleAssignments;
	}
</script>

<section>
	{textEntry}

	<button class="btn variant-soft-primary btn-sm" on:click={() => onRemoveAssignment(player)}
		>{buttonText}</button
	>
</section>
