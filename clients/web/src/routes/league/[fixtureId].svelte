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
  import type {LeagueFixtureValue} from "$lib/api";
  import {session} from "$app/stores";

  export let fixtureStore: LeagueFixtureStore;

  currentUser.vars = {orgId: $session?.user?.currentOrganizationId};

  let fetching = true;
  $: fetching = $fixtureStore.fetching;

  let fixture: LeagueFixtureValue;
  $: fixture = $fixtureStore.data?.fixture;
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3"
		title={fixture ? `${fixture.scheduleGroup.description} | ${fixture.homeFranchise.profile.title} vs ${fixture.awayFranchise.profile.title}` : ""}
	>
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full" />
			</div>
		{:else if fixture}
			<div class="w-96 mx-auto mb-8">
				<FixtureCard {fixture} hidebutton />
			</div>

			<div class="w-full grid grid-cols-2 lg:grid-cols-3 gap-8">
				{#each fixture.matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
					<section class="space-y-4">
						<header>
							<h3 class="text-2xl font-bold">{m.gameMode.description} | {m.skillGroup.profile.description}</h3>
						</header>
						{#if m.submissionStatus === "completed"}
							<span>Completed</span>
						{:else if m.submissionStatus === "ratifying"}
							<!-- TODO restrict who can ratify -->
							<a href={`/league/submit/${m.submissionId}`} class="btn btn-outline btn-success mx-auto">
								Ratify Results
							</a>
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
		{/if}
	</DashboardCard>
</DashboardLayout>


