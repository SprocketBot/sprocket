<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, Spinner, LeagueScheduleGroup,
	} from "$lib/components";
	import {
	    LeagueScheduleStore, type LeagueScheduleSeason, type LeagueScheduleWeek,
	} from "$lib/api";

	const store = new LeagueScheduleStore();
	let fetching = true;
	let schedule: LeagueScheduleSeason | undefined;
	let scheduleGroups: LeagueScheduleWeek[] = [];
	let currentWeek: LeagueScheduleWeek | undefined;

	$: {
	    // @ts-expect-error `fetching` exists on the query store but isn't defined in the type
	    fetching = $store.fetching;

	    schedule = $store.data?.seasons[0];
	    scheduleGroups = schedule ? schedule?.childGroups.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)) : [];

	    const nextWeekIndex = scheduleGroups.findIndex(sg => Date.parse(sg.start) > Date.now());
	    const currentWeekIndex = nextWeekIndex >= 1 ? nextWeekIndex - 1 : -1;
	    currentWeek = currentWeekIndex ? scheduleGroups[currentWeekIndex] : undefined;
	}
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="League Play Schedule">
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else if schedule}
			<h2 class="text-2xl text-accent font-bold mb-8">{schedule.game.title} | {schedule.description}</h2>

			<div class="flex flex-col gap-10">
				{#if currentWeek}
					<LeagueScheduleGroup scheduleGroup={currentWeek} isCurrentWeek />
				{/if}

				{#each scheduleGroups as week (week?.id)}
					<LeagueScheduleGroup scheduleGroup={week} />
				{/each}
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>
