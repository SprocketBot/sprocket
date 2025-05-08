<script lang="ts">
	import { roles, leagues, roleSeats } from '$lib/store/MockDataService.svelte';
	import type { DataObject } from '$lib/store/models/DataObject';
	import LeadershipCard from './LeadershipCard.svelte';
	import TeamRosterCard from './TeamRosterCard.svelte';

	let selectedFranchise: DataObject = { id: 1, name: 'Express' };
	let selectedGame: DataObject = { id: 1, name: 'Rocket League' };
</script>

<section>
	<u><b>{selectedFranchise.name}</b></u>
	<ul>
		{#each $roles as role}
			{#if role.roleCategory != 'Player'}
				<LeadershipCard {role} {selectedFranchise} />
			{/if}
		{/each}
	</ul>
	<br />
	<br />
	<ul>
		{#each $leagues as league}
			<TeamRosterCard {league} {selectedFranchise} />
			<br />
		{/each}
	</ul>
</section>
