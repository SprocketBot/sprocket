<script lang="ts">
    import {UserProfileStore, LeagueMatchesStore, type LeagueMatches$result} from "$houdini";
    import {onMount} from "svelte";
    import type {
        LeagueScheduleSeason, LeagueScheduleWeek
    } from "$lib/api";
    import {LeagueScheduleGroup} from "$lib/components";
    
    const profileStore = new UserProfileStore();

    onMount(() => {
        profileStore.fetch();
    });
    
    let matchData: LeagueMatches$result;
    let schedule: LeagueScheduleSeason | undefined;
    let scheduleGroups: LeagueScheduleWeek[] = [];
    let currentWeek: LeagueScheduleWeek | undefined;

    const sorter = (a,b) => { return (Date.parse(a.start) - Date.parse(b.start));};
    const matchStore = new LeagueMatchesStore();
    const loadData = async () => {
        console.log("Loading league match data.");
        const queryResult = await matchStore.fetch();
        if (queryResult.data) {
            matchData = queryResult.data;
        } else {
            throw new Error("Could not load the match data.");
        }
    }

</script>

{#await loadData()}
    Fetching data, please wait. 
{:then}
    {#each matchData.season as s}
        <h2 class="text-2xl text-accent font-bold mb-8">{s.game.title} | {s.description}</h2>
        <div class="flex flex-col gap-10">
            {#if currentWeek}
                <LeagueScheduleGroup scheduleGroup={currentWeek} isCurrentWeek />
            {/if}

            {#each s.childGroups.sort(sorter) as week (week?.id)}
                <LeagueScheduleGroup scheduleGroup={week} />
            {/each}
        </div>
    {/each}

{:catch someError}
    System error: {someError.message}
{/await}