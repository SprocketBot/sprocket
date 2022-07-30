<script context='module' lang='ts'>
  import {LeagueFixtureStore, currentUser} from "$lib/api";

  export const load = ({params}: unknown): unknown => ({
      props: {
          fixtureId: params.fixtureId,
          fixtureStore: new LeagueFixtureStore(parseInt(params.fixtureId)),
      },
  });

</script>

<script lang='ts'>
  import {
      DashboardLayout, DashboardCard, Spinner, FixtureCard,
  } from "$lib/components";
  import type {LeagueFixtureValue} from "$lib/api";
  import {goto} from "$app/navigation";
  import {session} from "$app/stores";

  export let fixtureId: number;
  export let fixtureStore: LeagueFixtureStore;

  currentUser.vars = {orgId: $session?.user?.currentOrganizationId};

  let fetching = true;
  $: fetching = $fixtureStore.fetching;

  let fixture: LeagueFixtureValue;
  $: fixture = $fixtureStore.data?.fixture;

  let currentUserFranchises: string[] | undefined;
  $: currentUserFranchises = $currentUser.data?.me?.members?.flatMap(m => m.players.flatMap(p => p.franchiseName as string) as string[]);

  let currentUserFranchiseStaff: string[] | undefined;
  $: currentUserFranchiseStaff = $currentUser.data?.me.members.flatMap(m => m.players.flatMap(p => p.franchisePositions as string[]) as string[]);

  let canSubmit = false;
  $: canSubmit = currentUserFranchises?.some(cuf => cuf === fixture?.awayFranchise.profile.title || fixture?.homeFranchise.profile.title === cuf) && $currentUser.data?.me.members;

</script>

<DashboardLayout>
	<DashboardCard class='col-span-8 row-span-3'
								 title={fixture ? `${fixture.scheduleGroup.description} | ${fixture.homeFranchise.profile.title} vs ${fixture.awayFranchise.profile.title}` : ""}>
		{#if fetching}
			<div class='h-full w-full flex items-center justify-center'>
				<Spinner class='h-16 w-full' />
			</div>
		{:else if fixture}
			<section class='flex'>
				<div class='w-1/6'>
					<FixtureCard {fixture} hidebutton />
				</div>
				<div class='w-5/6 grid grid-cols-3 gap-8'>
					{#each fixture.matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
						<section class='space-y-4'>
							<header>
								<h3 class='text-2xl font-bold'>{m.skillGroup.profile.description}</h3>
							</header>
							{#if canSubmit}
								{#if m.submitted}
									<span>Already Submitted</span>
								{:else}
									<button on:click={async () => goto(`/league/submit/${m.submissionId}`)}
													class='btn btn-outline btn-primary mx-auto'>Submit Replays
									</button>
								{/if}
							{/if}
						</section>
					{/each}
				</div>
			</section>
		{/if}


	</DashboardCard>
</DashboardLayout>


