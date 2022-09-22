<script lang="ts">
    import {Accordion, FixtureCard} from "$lib/components";
    import type {LeagueScheduleWeek} from "$lib/api";

    export let scheduleGroup: LeagueScheduleWeek;
</script>

<Accordion>
    <h3 slot="title" class="text-lg text-accent font-bold mb-2">
        {scheduleGroup.description}
    </h3>

    <div class="flex flex-row flex-wrap justify-center gap-4 lg:gap-8 border-accent border rounded-3xl p-4 lg:p-8">
        {#each scheduleGroup.fixtures as fixture (fixture?.id)}
            <FixtureCard {fixture}/>
        {/each}
    </div>
</Accordion>
