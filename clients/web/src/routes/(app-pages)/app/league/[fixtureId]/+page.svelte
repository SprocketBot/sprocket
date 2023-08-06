<script>
    import {FixtureCard} from "$lib/components";
    export let data;
    const fixture = data.lfsData.fixture;
    const matches = fixture.matchParents.map(mp => mp.match);
</script>
<div class="w-fit mx-auto mb-8">
    <FixtureCard {fixture} hidebutton />
</div>

<div class="w-full grid grid-cols-2 2xl:grid-cols-3 gap-8">
    {#each matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
        <section class="bg-gray-700 flex flex-col items-center gap-4 p-4 rounded-xl">
            <header>
                <h3 class="text-2xl font-bold">{m.gameMode.description} |
                {m.skillGroup.profile.description}</h3>
            </header>
            {#if m.submissionStatus === "completed"}
                <span class="btn btn-outline btn-disabled">Completed</span>
            {:else if m.submissionStatus === "ratifying"}
                {#if m.canRatify}
                    <a href={`/league/submit/${m.submissionId}`} class="btn btn-outline btn-success mx-auto">
                        Ratify Results
                    </a>
                {:else}
                    <span>Ratifying</span>
                {/if}
            {:else}
                {#if m.canSubmit}
                    <a href={`/league/submit/${m.submissionId}`} class="btn btn-outline btn-primary mx-auto">
                        Submit Replays
                    </a>
                {:else}
                    <span>Already Submitted</span>
                {/if}
            {/if}
        </section>
    {/each}
</div>