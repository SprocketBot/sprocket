<script lang="ts">
	import {
	    DashboardLayout,
	    DashboardCard,
	    Spinner,
	    FixtureCard,
	} from "$lib/components";
import {LeagueScheduleStore} from "$lib/api";

	const store = new LeagueScheduleStore();
	let fetching = true;
	$: fetching = $store.fetching;
	let schedule = undefined;
	$: schedule = $store.data?.schedule[0];
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="League Play Schedule">
		{#if fetching}
			<div class="h-full w-full flex items-center justify-cente`r">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else}
			<h2 class="text-2xl text-accent font-bold">{schedule.game.title} | {schedule.description}</h2>
			<div class="grid grid-cols-1 gap-4">
			{#each schedule.childGroups as week, wi (week?.id)}
				<div>
				<h3 class="text-lg text-accent font-bold text-center">{week.description}</h3>
				<div class="grid grid-cols-2 gap-4">
					{#each week.fixtures as fixture (fixture?.id)}
						<FixtureCard {fixture}/>
					{/each}
				</div>
				</div>
				{#if wi < schedule.childGroups.length - 1}
					<hl class="w-2/3 mx-auto border-accent border-b my-2"></hl>
				{/if}
			{/each}
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>
