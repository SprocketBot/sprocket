<script lang="ts">
	import { franchises, roles, leagues } from '$lib/store/MockDataService.svelte';
	import type { DataObject } from '$lib/store/models/DataObject';
	import LeadershipCard from './LeadershipCard.svelte';
	import TeamRosterCard from './TeamRosterCard.svelte';

	let selectedFranchise: DataObject = { id: 1, name: 'Express' };
</script>

<section>
	<u><b>{selectedFranchise.name}</b></u>
	<ul>
		{#each $roles as role}
			{#if role.name != 'Playing' && role.name != 'Non-Playing'}
				<LeadershipCard {role} />
			{/if}
		{/each}
	</ul>
	<ul>
		{#each $leagues as league}
			<TeamRosterCard {league} {selectedFranchise} />
			<br />
		{/each}
	</ul>
</section>
