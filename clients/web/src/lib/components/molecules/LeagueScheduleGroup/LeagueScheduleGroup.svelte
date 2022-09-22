<script lang="ts">
    import {Accordion, FixtureCard} from "$lib/components";
    import type {LeagueScheduleWeek} from "$lib/api";

    export let scheduleGroup: LeagueScheduleWeek;
    export let isCurrentWeek: boolean = false;

    const title = isCurrentWeek ? `Current Match (${scheduleGroup.description})` : scheduleGroup.description
</script>


<Accordion expanded={isCurrentWeek}> 
    <h3 slot="title" class="text-lg font-bold mb-4 divider">
        {title}
    </h3>

    <div class="flex flex-row flex-wrap justify-center gap-4 pt-2 lg:gap-8 lg:pt-4">
        {#each scheduleGroup.fixtures as fixture (fixture?.id)}
            <FixtureCard {fixture}/>
        {/each}
    </div>
</Accordion>
