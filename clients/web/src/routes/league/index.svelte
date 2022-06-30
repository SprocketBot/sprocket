<script lang="ts">
	import {
    DashboardLayout,
	    DashboardCard,
	    Spinner,
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
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else}
			<span class="text-2xl text-accent font-bold">{schedule.game.title} | {schedule.description}</span>
			<div class="grid grid-cols-1 gap-4">
			{#each schedule.childGroups as week (week.id)}
				<div>
				<span class="text-lg text-accent">{week.description}</span>
				<div class="grid grid-cols-2 gap-4">
					{#each week.fixtures as fixture (fixture.id)}
						<div class="flex justify-between">
							<span class="flex-1 text-right">{fixture.homeFranchise.profile.title}</span>
							<span class="mx-2">vs</span>
							<span class="flex-1">{fixture.awayFranchise.profile.title}</span>
						</div>
					{/each}
				</div>
				</div>
			{/each}
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>
