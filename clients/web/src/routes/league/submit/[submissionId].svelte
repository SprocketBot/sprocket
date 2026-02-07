<script context='module' lang='ts'>
  export const load = ({params}: unknown): unknown => ({
      props: {
          submissionId: params.submissionId,
      },
  });

</script>

<script lang='ts'>
  import {
      DashboardLayout, DashboardCard, SubmissionView, UploadReplaysModal, Spinner,
  } from "$lib/components";
  import {
      MatchStore, SubmissionStore, type Match,
  } from "$lib/api";

  export let submissionId: string;

  const submissionStore: SubmissionStore = new SubmissionStore(submissionId);
  
  const matchStore = new MatchStore(submissionId);
  let match: Match | undefined;
  $: match = $matchStore.data?.getMatchBySubmissionId;

  let uploadVisible = false;

  interface ExpectedPlayer {
      userId: number;
      name: string;
  }
  interface ReplayAccountPlayer {
      name: string;
      platform: string;
      id: string;
      userId: number | null;
  }
  interface TeamPlayers<TPlayer> {
      teamIndex: number;
      players: TPlayer[];
  }
  interface MismatchDetails {
      gameIndex: number;
      expectedTeams: Array<TeamPlayers<ExpectedPlayer>>;
      foundTeams: Array<TeamPlayers<ReplayAccountPlayer>>;
      unexpectedRecognizedPlayers: ExpectedPlayer[];
      missingExpectedPlayers: ExpectedPlayer[];
  }
  interface RawDataPayload {
      mismatch?: MismatchDetails;
  }

  const parseRawData = (reason: string): RawDataPayload | null => {
      const matchRaw = reason.match(/RawData: (\{.*\})/);
      if (!matchRaw) return null;
      try {
          return JSON.parse(matchRaw[1]) as RawDataPayload;
      } catch (_e) {
          return null;
      }
  };

  const cleanReason = (reason: string): string => reason.replace(/\s*RawData:\s*\{.*\}\s*$/, "")
      .trim();
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="Submit Replays">
		{#if $submissionStore.fetching || $matchStore?.fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full" />
			</div>
		{:else}
			<header>
				<h2 class="text-3xl font-bold">{match?.matchParent.fixture.scheduleGroup.description} | {match?.matchParent.fixture.homeFranchise.profile.title} vs {match?.matchParent.fixture.awayFranchise.profile.title}</h2>
				<h3 class="text-2xl font-bold">{match?.gameMode.description} | {match?.skillGroup.profile.description}</h3>
			</header>


			{#if match?.rounds?.length}
				<h1>Match has already been submitted.</h1>
			{:else if $submissionStore.data?.submission}
				{#if $submissionStore.data?.submission.status === "REJECTED"}
					<div>
						<h3 class="text-error-content text-2xl font-bold">Submission Rejected</h3>
						<ul class="mb-8">
							{#key $submissionStore.data?.submission}
								{#each $submissionStore.data?.submission.rejections.filter(r => !r.stale) as rejection}
                  {@const rawData = parseRawData(rejection.reason)}
									<li class="mb-4">
                    <p>{rejection.playerName} has rejected replays because "{cleanReason(rejection.reason)}"</p>
                    {#if rawData?.mismatch}
                      <div class="mt-2 p-3 rounded border border-warning text-sm space-y-2">
                        <p class="font-semibold">Mismatch details for game {Number(rawData.mismatch.gameIndex) + 1}</p>
                        {#if rawData.mismatch.unexpectedRecognizedPlayers.length > 0}
                          <p><span class="font-semibold">Unexpected:</span> {rawData.mismatch.unexpectedRecognizedPlayers.map(p => `${p.name} (${p.userId})`).join(", ")}</p>
                        {/if}
                        {#if rawData.mismatch.missingExpectedPlayers.length > 0}
                          <p><span class="font-semibold">Missing:</span> {rawData.mismatch.missingExpectedPlayers.map(p => `${p.name} (${p.userId})`).join(", ")}</p>
                        {/if}

                        <div class="overflow-x-auto">
                          <table class="table table-compact w-full">
                            <thead>
                              <tr>
                                <th>Expected Team</th>
                                <th>Expected Players</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each rawData.mismatch.expectedTeams as team}
                                <tr>
                                  <td>Team {Number(team.teamIndex) + 1}</td>
                                  <td>{team.players.map(p => `${p.name} (${p.userId})`).join(", ")}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>

                        <div class="overflow-x-auto">
                          <table class="table table-compact w-full">
                            <thead>
                              <tr>
                                <th>Found Team</th>
                                <th>Account</th>
                                <th>Platform</th>
                                <th>Account ID</th>
                                <th>User</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each rawData.mismatch.foundTeams as team}
                                {#each team.players as player}
                                  <tr>
                                    <td>Team {Number(team.teamIndex) + 1}</td>
                                    <td>{player.name}</td>
                                    <td>{player.platform}</td>
                                    <td class="break-all">{player.id}</td>
                                    <td>{player.userId ?? "Unknown"}</td>
                                  </tr>
                                {/each}
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    {/if}
                  </li>
								{/each}
							{/key}
						</ul>
						<button class="btn btn-primary btn-outline" on:click={() => { uploadVisible = true }}>Resubmit</button>
						<UploadReplaysModal bind:visible={uploadVisible} {submissionId} />
					</div>
				{:else}
					<SubmissionView submission={$submissionStore.data.submission} />
				{/if}
			{:else}
				<button class="btn-large btn-outline btn btn-primary" on:click={() => { uploadVisible = true }}>Upload Replays
				</button>
				<UploadReplaysModal bind:visible={uploadVisible} {submissionId} />
			{/if}
		{/if}
	</DashboardCard>
</DashboardLayout>
