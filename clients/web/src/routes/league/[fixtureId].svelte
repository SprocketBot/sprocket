<script context="module" lang="ts">
    import {currentUser, LeagueFixtureStore} from "$lib/api";

    export const load = ({params}: unknown): unknown => ({
        props: {
            fixtureStore: new LeagueFixtureStore(parseInt(params.fixtureId)),
        },
    });
</script>

<script lang="ts">
    import {session} from "$app/stores";
    import type {Fixture} from "$lib/api";
    import {
        DashboardCard,
        DashboardLayout,
        FixtureCard,
        Spinner,
    } from "$lib/components";

    export let fixtureStore: LeagueFixtureStore;

    currentUser.vars = {orgId: $session?.user?.currentOrganizationId};

    let fetching = true;
    $: fetching = $fixtureStore.fetching;

    let fixture: Fixture | undefined;
    $: fixture = $fixtureStore.data?.fixture;
</script>

<DashboardLayout>
    <DashboardCard
        class="col-span-8 row-span-3"
        title={fixture
            ? `${fixture.scheduleGroup.description} | ${fixture.homeFranchise.profile.title} vs ${fixture.awayFranchise.profile.title}`
            : ""}
    >
        {#if fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full" />
            </div>
        {:else if fixture}
            <div class="w-fit mx-auto mb-8">
                <FixtureCard {fixture} hidebutton />
            </div>

            <div class="w-full grid grid-cols-2 2xl:grid-cols-3 gap-8">
                {#each fixture.matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
                    <section
                        class="bg-gray-700 flex flex-col items-center gap-4 p-4 rounded-xl"
                    >
                        <header>
                            <h3 class="text-2xl font-bold">
                                {m.gameMode.description} | {m.skillGroup.profile
                                    .description}
                            </h3>
                        </header>
                        {#if m.submissionStatus === "completed"}
                            <span class="btn btn-outline btn-disabled"
                                >Completed</span
                            >
                        {:else if m.submissionStatus === "ratifying"}
                            {#if m.canRatify}
                                <a
                                    href={`/league/submit/${m.submissionId}`}
                                    class="btn btn-outline btn-success mx-auto"
                                >
                                    Ratify Results
                                </a>
                            {:else}
                                <span>Ratifying</span>
                            {/if}
                        {:else if m.canSubmit}
                            <a
                                href={`/league/submit/${m.submissionId}`}
                                class="btn btn-outline btn-primary mx-auto"
                            >
                                Submit Replays
                            </a>
                        {:else}
                            <span>Submitting</span>
                        {/if}
                    </section>
                {/each}
            </div>
        {/if}
    </DashboardCard>
</DashboardLayout>
