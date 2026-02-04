# League Play Submission Flow

This report walks the reader from the League Play navigation item through the fixture selection, replay upload, and ratification screens, including every cross-check that ensures only the right user (organization, franchise, or player role) can perform each action.

## 1. Entry & Schedule Discovery
- Navigation exposes League Play via `LEAGUE_NAV_ITEM`, which makes `/league` reachable from the dashboard.
- `clients/web/src/routes/league/index.svelte` instantiates `LeagueScheduleStore`, waits for the season data, and renders each group via `LeagueScheduleGroup`.
- `LeagueScheduleStore` executes `getScheduleGroups(type: "SEASON")`, which returns fixtures for every child week.

```ts
// clients/web/src/lib/stores/navigation.store.ts
export const LEAGUE_NAV_ITEM = {target: "/league", label: "League Play"};

// clients/web/src/routes/league/index.svelte
$: schedule = $store.data?.seasons[0];
$: scheduleGroups = schedule
    ? schedule.childGroups.sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    : [];

// clients/web/src/lib/api/queries/league/LeagueSchedule.store.ts
query {
  seasons: getScheduleGroups(type: "SEASON") {
    childGroups {
      fixtures { id homeFranchise { profile { title } } awayFranchise { profile { title } } }
    }
  }
}
```

## 2. Fixture & Match Selection
- Each week renders a `LeagueScheduleGroup`, which loops its `fixtures` and embeds `FixtureCard`.
- The `Details` button pushes the router to `/league/${fixture.id}` so `LeagueFixtureStore` fetches matches for that fixture.
- `LeagueFixtureStore` fields include `matches[].submissionId`, `submissionStatus`, and the `canSubmit`/`canRatify` flags that drive UI controls.

```svelte
<!-- clients/web/src/lib/components/league/molecules/FixtureCard.svelte -->
<button on:click={() => goto(`/league/${fixture.id}`)}>Details</button>

<!-- clients/web/src/routes/league/[fixtureId].svelte -->
{#each fixture.matches as m}
  {#if m.submissionStatus === "ratifying" && m.canRatify}
    <a href={`/league/submit/${m.submissionId}`}>Ratify Results</a>
  {:else if m.canSubmit}
    <a href={`/league/submit/${m.submissionId}`}>Submit Replays</a>
  {/if}
{/each}
```

## 3. Submission & Upload Screen
- The `/league/submit/[submissionId]` page creates `SubmissionStore` (live query) and `MatchStore`, then shows `SubmissionView` whenever a submission exists.
- When there is no submission, the page renders `UploadReplaysModal`, which calls `uploadReplaysMutation` (GraphQL `parseReplays`) to stream files.
- Once stats exist, `SubmissionView` renders `RatificationView`, which ties `submission.userHasRatified` to `RatifySubmissionMutation`.

```svelte
<!-- clients/web/src/routes/league/submit/[submissionId].svelte -->
const submissionStore = new SubmissionStore(submissionId);
const matchStore = new MatchStore(submissionId);
{#if $submissionStore.data?.submission}
  <SubmissionView submission={$submissionStore.data.submission} />
{:else}
  <UploadReplaysModal {submissionId} />
{/if}

<!-- clients/web/src/lib/components/organisms/scrims/modals/UploadReplaysModal.svelte -->
await uploadReplaysMutation({
  files: files as FileUpload[],
  submissionId,
});

<!-- clients/web/src/lib/api/mutations/UploadReplays.mutation.ts -->
mutation ($files: [Upload!]!, $submissionId: String!) {
  parseReplays(files: $files, submissionId: $submissionId)
}

<!-- clients/web/src/lib/components/organisms/submissions/RatificationView.svelte -->
let hasRatified = submission.userHasRatified;
async function ratifyScrim() {
  if (hasRatified) return;
  await RatifySubmissionMutation({submissionId: submission.id});
  hasRatified = true;
}
```

## 4. Server-Side Property Checks
1. `ScheduleGroupModResolver.getScheduleGroups` (and `CurrentUser.members`) enforce that the request includes `user.currentOrganizationId`, so league data is scoped to a chosen org.
2. `ReplayParseModResolver.parseReplays` & `ratifySubmission` route `user.userId`/`currentOrganizationId` into `ReplayParseService`.
3. `ReplayParseService.parseReplays` looks up `memberService.getMemberByUserIdAndOrganization` and then calls `SubmissionEndpoint.CanSubmitReplays`. `canSubmitReplays` validates membership in the scrim or franchise/staff role before allowing uploads.
4. `ReplayParseService.ratifySubmission` also uses `memberService.getMemberByUserIdAndOrganization` then `CanRatifySubmission` to ensure the submission is validated and the user is the correct player or staff member.
5. `ReplaySubmissionUtilService` contains the detailed franchise/player checks (`submissionIsScrim`, `submissionIsMatch`, `GetPlayerFranchises`, `staffPositions`) that enforce property validation for both submission and ratification.

```ts
// core/src/scheduling/schedule-group/schedule-group.mod.resolver.ts
if (!user.currentOrganizationId) {
  throw new GraphQLError("You must select an organization");
}

// core/src/replay-parse/replay-parse.service.ts
const member = await this.memberService.getMemberByUserIdAndOrganization(userId, organizationId);
const canSubmitResponse = await this.submissionService.send(SubmissionEndpoint.CanSubmitReplays, { memberId: member.id, userId, submissionId });

// core/src/organization/member/member.service.ts
async getMemberByUserIdAndOrganization(userId: number, organizationId: number) {
  return this.memberRepository.findOneOrFail({ where: { organizationId, userId } });
}

// microservices/submission-service/src/replay-submission/replay-submission-util.service.ts
if (submissionIsMatch(submissionId)) {
  const franchiseResult = await this.coreService.send(CoreEndpoint.GetPlayerFranchises, { userId });
  const targetFranchise = franchises.find(f => f.name === homeFranchise.name || f.name === awayFranchise.name);
  if (!targetFranchise || !targetFranchise.staffPositions.length) {
    return { canSubmit: false, reason: "You are not on the correct franchise" };
  }
}
```

This file captures the complete code path, including all guards, queries, and UI components needed to open League Play, select a fixture, upload replays, and ratify the results.
