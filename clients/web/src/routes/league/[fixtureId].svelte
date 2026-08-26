<script context="module" lang="ts">
  import {currentUser, LeagueFixtureStore} from "$lib/api";

  export const load = ({params}: unknown): unknown => ({
      props: {
          fixtureStore: new LeagueFixtureStore(parseInt(params.fixtureId)),
      },
  });

</script>

<script lang="ts">
  import {
      DashboardLayout, DashboardCard, Spinner, FixtureCard,
  } from "$lib/components";
  import type {Fixture} from "$lib/api";
  import {session} from "$app/stores";

  export let fixtureStore: LeagueFixtureStore;

  currentUser.vars = {orgId: $session?.user?.currentOrganizationId};

  let fetching = true;
  $: fetching = $fixtureStore.fetching;

  let fixture: Fixture | undefined;
  $: fixture = $fixtureStore.data?.fixture;

  // Debug logging
  $: {
      console.log('[League Fixture] Store state:', {
          fetching: $fixtureStore.fetching,
          hasData: !!$fixtureStore.data,
          hasFixture: !!$fixtureStore.data?.fixture,
          matchCount: $fixtureStore.data?.fixture?.matches?.length,
          error: $fixtureStore.error,
          storeValue: $fixtureStore,
      });
  }
</script>

<DashboardLayout>
	<DashboardCard class="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-8 row-span-1 md:row-span-3"
		title={fixture ? `${fixture.scheduleGroup.description} | ${fixture.homeFranchise.profile.title} vs ${fixture.awayFranchise.profile.title}` : ""}
	>
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full" />
			</div>
		{:else if $fixtureStore.error}
			<div class="alert alert-error">
				<div>
					<h3 class="font-bold">Error Loading Fixture</h3>
					<div class="text-sm">{$fixtureStore.error.message || JSON.stringify($fixtureStore.error)}</div>
				</div>
			</div>
		{:else if fixture}
			<div class="w-fit mx-auto mb-8">
				<FixtureCard {fixture} hidebutton />
			</div>

			{#if fixture.matches && fixture.matches.length > 0}
				<div class="w-full grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-8">
					{#each fixture.matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
						<section class="bg-gray-700 flex flex-col items-center gap-4 p-4 rounded-xl">
							<header>
								<h3 class="text-lg md:text-2xl font-bold text-center">{m.gameMode.description} | {m.skillGroup.profile.description}</h3>
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
									<span>Submitting</span>
								{/if}
							{/if}
						</section>
					{/each}
				</div>
			{:else}
				<div class="alert alert-warning">
					<div>No matches found for this fixture.</div>
				</div>
			{/if}
		{:else}
			<div class="alert alert-warning">
				<div>Fixture not found or no data returned.</div>
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>


