<script context="module" lang="ts">
	import {LeagueFixtureStore} from "$lib/api";

	export const load = ({params}: unknown): unknown => ({
	    props: {
	        fixtureId: params.fixtureId,
	        fixtureStore: new LeagueFixtureStore(parseInt(params.fixtureId)),
	    },
	});

</script>

<script lang="ts">
	import {
	    DashboardLayout, DashboardCard, Spinner, FixtureCard,
	} from "$lib/components";
	import type {LeagueFixtureValue} from "$lib/api";
	import {goto} from "$app/navigation";
import {currentUser} from "../../lib/index.js";

	export let fixtureId: number;
	export let fixtureStore: LeagueFixtureStore;

	let fetching = true;
	$: fetching = $fixtureStore.fetching;

	let fixture: LeagueFixtureValue;
	$: fixture = $fixtureStore.data?.fixture;

	let currentUserFranchise: string;
	$: currentUserFranchise = $currentUser.data?.me.members[0].players[0].franchiseName;


	let canSubmit = false;
	$: canSubmit = fixture?.awayFranchise.profile.title === currentUserFranchise || fixture?.homeFranchise.profile.title === currentUserFranchise;

</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title={fixture ? `${fixture.scheduleGroup.description} | ${fixture.homeFranchise.profile.title} vs ${fixture.awayFranchise.profile.title}` : ""}>
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else if fixture}
			<section class="flex">
				<div class="w-1/6">
					<FixtureCard {fixture} hidebutton/>
				</div>
				<div class="w-5/6 grid grid-cols-3 gap-8">
					{#each fixture.matches.sort((a, b) => a.skillGroup.ordinal - b.skillGroup.ordinal) as m}
						<section class="space-y-4">
							<header>
								<h3 class="text-2xl font-bold">{m.skillGroup.description}</h3>
							</header>
							{#if canSubmit}
								{#if m.submitted}
									<span>Already Submitted</span>
								{:else}
									<button on:click={async () => goto(`/league/submit/${m.submissionId}`)} class="btn btn-outline btn-primary mx-auto">Submit Replays</button>
								{/if}
							{/if}
						</section>
					{/each}
				</div>
			</section>
		{/if}


	</DashboardCard>
</DashboardLayout>


