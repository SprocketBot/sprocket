<script lang="ts">
	import { franchises, roles, leagues } from '$lib/store/MockDataService.svelte';
	import LeadershipCard from './LeadershipCard.svelte';
	import TeamRosterCard from './TeamRosterCard.svelte';
</script>

<section>
	<u><b>{$franchises.at(0)?.name}</b></u>
	<ul>
		{#each $roles as role}
			{#if role.name != 'Playing' && role.name != 'Non-Playing'}
				<LeadershipCard {role} />
			{/if}
		{/each}
	</ul>
	<ul>
		{#each $leagues as league}
			<TeamRosterCard {league} />
			<br />
		{/each}
	</ul>
</section>
