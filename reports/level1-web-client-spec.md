# Sprocket Level 1 Spec: clients/web

Low-level public API inventory for the web client.

- TS modules parsed: 36
- TS exported entities: 92
- Svelte files parsed: 86
- Svelte files with exported props: 48
- Svelte files with emitted events: 3
- Svelte files with slots: 17

## TypeScript Module Surface

### clients/web/src/lib/api/client.ts

- function **initializeClient(sessionInput: App.Session): void**

### clients/web/src/lib/api/core/BaseStore.ts

- class **BaseStore**
  - public properties: none
  - public methods: subscribe(sub: (T) => unknown): () => void

### clients/web/src/lib/api/core/LiveQueryStore.ts

- class **LiveQueryStore**
  - public properties: none
  - public methods: subscriptionVariables(): SV, subscriptionVariables(v: SV), subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void, invalidate(): void

### clients/web/src/lib/api/core/QueryStore.ts

- class **QueryStore**
  - public properties: none
  - public methods: vars(newVars: V), subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void, set(v: V): void, invalidate(): void

### clients/web/src/lib/api/core/SubscriptionStore.ts

- class **SubscriptionStore**
  - public properties: none
  - public methods: vars(): V, vars(v: V), subscribe(sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown): () => void, invalidate(): void

### clients/web/src/lib/api/mutations/ReportMemberPlatformAccount.mutation.ts

- interface **ReportMemberPlatformAccountVariables** -> userId: number, organizationId: number, tracker: string, platform: string, platformId: string
- interface **ReportMemberPlatformAccountResponse** -> reportMemberPlatformAccount: string

### clients/web/src/lib/api/mutations/UploadReplays.mutation.ts

- interface **UploadReplaysResponse** -> parseReplays: string[]
- interface **UploadReplaysVariables** -> files: FileUpload[], submissionId: string

### clients/web/src/lib/api/queries/CurrentUser.store.ts

- interface **CurrentUserResult** -> me: { id: number; members: Array<{ id: number; players: { skillGroup: { game: { title: string; }; }; franchisePositions: string[]; franchiseName: string; }; }>; }
- interface **CurrentUserVars** -> orgId?: number
- class **CurrentUserStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/game-features/feature.types.ts

- enum **FeatureCode** -> AUTO_SALARIES, AUTO_RANKOUTS

### clients/web/src/lib/api/queries/game-features/GameFeature.store.ts

- interface **GameFeatureResult** -> getFeatureEnabled: boolean
- interface **GameFeatureVariables** -> code: FeatureCode, gameId: number
- class **GameFeatureStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/GamesAndModes.store.ts

- interface **GamesAndModesValue** -> games: Array<{ id: number; title: string; modes: Array<{ id: number; teamSize: number; teamCount: number; description: string; }>; }>
- class **GamesAndModesStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/league/LeagueFixture.store.ts

- interface **FixtureFranchise** -> profile: { title: string; primaryColor: string; secondaryColor: string; photo: {url: string;}; }
- interface **Fixture** -> id: number, homeFranchise: FixtureFranchise, awayFranchise: FixtureFranchise, scheduleGroup: {description: string;}, matches: Array<{ id: number; skillGroup: { ordinal: number; profile: { description: string; }; }; submissionId: string; gameMode: {description: string;}; submissionStatus: "submitting" | "ratifying" | "completed"; canSubmit: boolean; canRatify: boolean; }>
- interface **LeagueFixtureValue** -> fixture: Fixture
- interface **LeagueFixtureVars** -> id: number
- class **LeagueFixtureStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/league/LeagueSchedule.store.ts

- interface **LeagueScheduleVars** -> none
- interface **LeagueScheduleValue** -> seasons: LeagueScheduleSeason[]
- class **LeagueScheduleStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/league/LeagueSchedule.types.ts

- interface **LeagueScheduleFranchise** -> title: string, primaryColor: string, secondaryColor: string, photo: { url: string; }
- interface **LeagueScheduleFixture** -> id: number, homeFranchise: { profile: LeagueScheduleFranchise; }, awayFranchise: { profile: LeagueScheduleFranchise; }
- interface **LeagueScheduleWeek** -> id: number, start: string, description: string, fixtures: LeagueScheduleFixture[]
- interface **LeagueScheduleSeason** -> id: number, description: string, game: { id: number; title: string; }, type: { name: string; }, childGroups: LeagueScheduleWeek[]

### clients/web/src/lib/api/queries/match/Match.store.ts

- interface **Match** -> id: number, rounds: Array<{ id: number; }>, skillGroup: { profile: { description: string; }; }, gameMode: { description: string; }, matchParent: { fixture: { scheduleGroup: { description: string; }; homeFranchise: { profile: { title: string; }; }; awayFranchise: { profile: { title: string; }; }; }; }
- interface **MatchResult** -> getMatchBySubmissionId: Match
- interface **MatchVars** -> submissionId: string
- class **MatchStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/RestrictedPlayers.store.ts

- interface **MemberRestriction** -> id: number, type: MemberRestrictionType, expiration: Date, reason: string, member: Member, manualExpiration?: Date, manualExpirationReason?: string, memberId: number
- interface **MemberRestrictionEvent** -> eventType: MemberRestrictionEventType
- interface **RestrictedPlayersStoreValue** -> getActiveMemberRestrictions: MemberRestriction[]
- interface **RestrictedPlayersSubscriptionValue** -> followRestrictedMembers: MemberRestrictionEvent
- interface **RestrictedPlayersStoreVariables** -> none
- interface **RestrictedPlayersStoreSubscriptionVariables** -> none
- class **RestrictedPlayersStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/scrims/ActiveScrimPlayers.store.ts

- interface **Player** -> id: number, name: string, checkedIn: boolean, orgId: number

### clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts

- type **ActiveScrims** = Array<CurrentScrim & {organizationId: number;}>
- interface **ActiveScrimsStoreValue** -> activeScrims: ActiveScrims
- interface **ActiveScrimsSubscriptionValue** -> activeScrims: { scrim: ActiveScrims[number]; event: EventTopic; }
- interface **ActiveScrimsStoreVariables** -> none
- interface **ActiveScrimsStoreSubscriptionVariables** -> none
- class **ActiveScrimsStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts

- interface **CurrentScrim** -> id: string, playerCount: number, maxPlayers: number, status: string, createdAt: Date, skillGroup: { profile: { description: string; }; }, currentGroup?: { code: string; players: string[]; }, gameMode: { description: string; game: { title: string; }; }, settings: { competitive: boolean; mode: string; lfs: boolean; }, players: Array<{ id: number; name: string; checkedIn: boolean; }>, ... +4 more
- interface **CurrentScrimStoreValue** -> currentScrim: CurrentScrim
- interface **CurrentScrimSubscriptionValue** -> currentScrim: { scrim: CurrentScrim; }
- interface **CurrentScrimStoreVariables** -> none
- interface **CurrentScrimStoreSubscriptionVariables** -> none

### clients/web/src/lib/api/queries/scrims/LFSScrims.store.ts

- class **LFSScrimsStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/scrims/PendingScrims.store.ts

- interface **PendingScrim** -> id: string, playerCount: number, maxPlayers: number, status: "PENDING" | "EMPTY" | "POPPED", createdAt: Date, gameMode: { description: string; game: { title: string; }; }, settings: { competitive: boolean; mode: "TEAMS" | "ROUND_ROBIN"; lfs: boolean; }, skillGroup: { profile: { description: string; }; }

### clients/web/src/lib/api/queries/scrims/ScrimMetrics.store.ts

- interface **MetricsResult** -> metrics: { pendingScrims: number; playersQueued: number; playersScrimming: number; totalScrims: number; totalPlayers: number; completedScrims: number; previousCompletedScrims: number; }

### clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts

- interface **ActiveSubmissionsStoreValue** -> activeSubmissions: Submission[]
- interface **ActiveSubmissionsSubscriptionValue** -> activeSubmissions: { submission: Submission; event: EventTopic; }
- interface **ActiveSubmissionsStoreVariables** -> none
- interface **ActiveSubmissionsSubscriptionVariables** -> none
- class **ActiveSubmissionsStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/submissions/Submission.store.ts

- interface **SubmissionStoreValue** -> submission: Submission
- interface **SubmissionSubscriptionValue** -> submission: Submission
- interface **SubmissionStoreVariables** -> submissionId: string
- interface **SubmissionStoreSubscriptionVariables** -> submissionId: string
- class **SubmissionStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/queries/submissions/submission.types.ts

- interface **RatifierInfo** -> playerId: number, franchiseId: number, franchiseName: string, ratifiedAt: string
- interface **SubmissionRejection** -> playerId: string, playerName: string, reason: string, stale: boolean
- interface **SubmissionProgress** -> progress: { value: number; message: string; }, status: "Pending" | "Error" | "Complete", taskId: string, error?: string
- interface **Submission** -> id: string, status: string, creatorId: number, ratifications: number, requiredRatifications: number, ratifiers: RatifierInfo[], userHasRatified: boolean, type: "MATCH" | "SCRIM", scrimId?: string, matchId?: number, ... +5 more

### clients/web/src/lib/api/queries/submissions/SubmissionStats.store.ts

- interface **SubmissionStatsData** -> games: Array<{ teams: Array<{ result?: "WIN" | "LOSS" | "DRAW" | "UNKNOWN"; score?: number; stats?: Record<string, number>; players: Array<{ name: string; stats?: Record<string, number>; }>; }>; }>
- class **SubmissionStatsStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/api/subscriptions/FollowReplayParse.subscription.ts

- interface **FollowReplayParseProgressMessage** -> followReplayParse: ProgressMessage<unknown>
- interface **FollowReplayParseProgressVariables** -> submissionId: string
- class **FollowReplayParseStore**
  - public properties: none
  - public methods: none

### clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts

- type **ChatwootConversationLabel** = "org-mle"
- interface **ChatwootCustomAttributes** -> userId: number
- interface **ChatwootSettings** -> showPopoutButton: boolean, hideMessageBubble: boolean, position: "left" | "right", locale: string, type: "standard" | "expanded_bubble", darkMode: "light" | "auto"
- interface **ChatwootSDK** -> run: ({websiteToken, baseUrl}: {websiteToken: string; baseUrl: string;}) => void
- interface **ChatwootUser** -> name?: string, avatar_url?: string, email?: string, identifier_hash?: string, phone_number?: string, description?: string, country_code?: string, city?: string, company_name?: string, social_profiles?: { twitter?: string; linkedin?: string; facebook?: string; github?: string; }
- interface **ChatwootGlobal** -> baseUrl: string, hasLoaded: boolean, hideMessageBubble: boolean, isOpen: boolean, position: "left" | "right", websiteToken: string, locale: string, type: unknown, launcherTitle: string, showPopoutButon: boolean, ... +13 more

### clients/web/src/lib/components/molecules/toasts/ToastStore.ts

- interface **Toast** -> content: string, status: "info" | "error", id?: string

### clients/web/src/lib/stores/navigation.store.ts

- interface **NavigationItem** -> label: string, target: string

### clients/web/src/lib/utils/actions/oauthPopupAction.ts

- function **oauthPopup(node: HTMLElement, params: {windowUrl: string; callback: (x: MessageEvent) => unknown;}): void**

### clients/web/src/lib/utils/findLast/findLast.ts

- function **findLast(arr: T[] | undefined, predicate: (value?: T, index?: number, arr?: T[]) => boolean): T | undefined**

### clients/web/src/lib/utils/text/screamingSnakeToHuman.ts

- function **screamingSnakeToHuman(text: string): string**

### clients/web/src/lib/utils/types/Config.ts

- type **Stack** = "local" | "dev" | "staging" | "main"
- interface **Config** -> client: { gqlUrl: string; secure: boolean; chatwoot: { enabled: boolean; url: string; websiteToken: string; }; stack: Stack; }, server: { chatwoot: { hmacKey: string; }; stack: Stack; }

### clients/web/src/lib/utils/types/progress.types.ts

- enum **ProgressStatus** -> Pending, Complete, Error
- interface **Progress** -> value: number, message: string
- interface **ProgressMessage** -> taskId: string, status: ProgressStatus, progress: Progress, result: TaskResult | null, error: string | null

### clients/web/src/lib/utils/types/SessionUser.ts

- interface **SessionUser** -> userId: number, username: string, currentOrganizationId: number, orgTeams: number[]

## Svelte Component/Route Surface

### routes

- **clients/web/src/routes/__layout.svelte**
  - props: none
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/routes/admin/__layout.svelte**
  - props: none
  - exported values: load: Load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/routes/admin/index.svelte**
  - props: none
  - exported values: load: Load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/auth/login.svelte**
  - props: none
  - exported values: load: Load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/index.svelte**
  - props: none
  - exported values: load: Load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/league/__layout.svelte**
  - props: none
  - exported values: none
  - exported functions: load({session}: LoadInput)
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/routes/league/[fixtureId].svelte**
  - props: fixtureStore: LeagueFixtureStore
  - exported values: load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/league/scrim/_layout.svelte**
  - props: none
  - exported values: none
  - exported functions: load({session}: LoadInput)
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/routes/league/scrim/[submissionId].svelte**
  - props: submissionId: string
  - exported values: load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/league/submit/[submissionId].svelte**
  - props: submissionId: string
  - exported values: load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/routes/scrims/__layout.svelte**
  - props: none
  - exported values: load: Load
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default

### components

- **clients/web/src/lib/components/abstract/Authentication/AuthGuard.svelte**
  - props: none
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default, unauthenticated
- **clients/web/src/lib/components/abstract/Authentication/OrgGuard.svelte**
  - props: expectedOrg
  - exported values: extractJwt
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default, unauthorized
- **clients/web/src/lib/components/abstract/Authentication/TeamGuard.svelte**
  - props: expectedTeam
  - exported values: extractJwt
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default, unauthorized
- **clients/web/src/lib/components/abstract/Portal.svelte**
  - props: target
  - exported values: none
  - exported functions: portal(el, target = "body")
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/lib/components/atoms/Accordion.svelte**
  - props: title: string | undefined, expanded: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default, title
- **clients/web/src/lib/components/atoms/Avatar.svelte**
  - props: src: string, alt: string
  - exported values: none
  - exported functions: none
  - export aliases: _class as class
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/atoms/Card.svelte**
  - props: compact: boolean | undefined
  - exported values: none
  - exported functions: none
  - export aliases: _class as class
  - emitted events: none
  - slots: default, figure, title
- **clients/web/src/lib/components/atoms/Collapse.svelte**
  - props: title: string, open: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/lib/components/atoms/DashboardNumberCard.svelte**
  - props: description: string, title: string, value: number
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/atoms/Dropdown.svelte**
  - props: items: Array<{
  - exported values: none
  - exported functions: none
  - export aliases: _class as class
  - emitted events: none
  - slots: handle
- **clients/web/src/lib/components/atoms/FileInput.svelte**
  - props: label: string, files: RemovableFile[], disabled: boolean | undefined, unique
  - exported values: filesToFileList
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/atoms/Modal.svelte**
  - props: title: string, visible: boolean, canClickOutside: boolean, id: string, size: "sm" | "md" | "lg" | "xl" | "full"
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: actions, body
- **clients/web/src/lib/components/atoms/Progress.svelte**
  - props: value: number, max: number
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/atoms/Spinner.svelte**
  - props: none
  - exported values: none
  - exported functions: none
  - export aliases: _class as class
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/layouts/CenteredCardLayout.svelte**
  - props: none
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default
- **clients/web/src/lib/components/layouts/DashboardLayout.svelte**
  - props: none
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: default, sidebar
- **clients/web/src/lib/components/league/atoms/FranchiseVsCard.svelte**
  - props: profile: LeagueScheduleFranchise
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/league/molecules/FixtureCard.svelte**
  - props: fixture: LeagueScheduleFixture, hidebutton: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/AdminSettings/GameFeatureToggle.svelte**
  - props: label: string, value: boolean | undefined, loading: boolean | undefined
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: toggle
  - slots: none
- **clients/web/src/lib/components/molecules/dashboard/DashboardCard.svelte**
  - props: title: string, quietTitle: boolean
  - exported values: none
  - exported functions: none
  - export aliases: _class as class
  - emitted events: none
  - slots: default
- **clients/web/src/lib/components/molecules/FileBlock.svelte**
  - props: filename: string, canRemove: boolean, loading: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/LeagueScheduleGroup/LeagueScheduleGroup.svelte**
  - props: scheduleGroup: LeagueScheduleWeek, isCurrentWeek: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/AdminSubmissionTable/Row.svelte**
  - props: submission: Submission
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: click
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/AdminSubmissionTable/SubmissionDetailModal.svelte**
  - props: submission: Submission, visible
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/fixtures/GameCard.svelte**
  - props: title: string, game: CurrentScrim["games"][number] | SubmissionStatsData["games"][number], showCheckbox: boolean, checkboxValue: boolean, showResult: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/fixtures/RoundRobinFixture.svelte**
  - props: scrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/fixtures/TeamsFixture.svelte**
  - props: scrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/modals/ScrimManagementActions.svelte**
  - props: targetScrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: uploading
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/modals/ScrimManagementPlayerTable.svelte**
  - props: targetScrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/ReplayUpload.svelte**
  - props: filename: string, progressStore: Readable<ProgressMessage<unknown>>, canRemove: boolean
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/ScrimCard.svelte**
  - props: scrim: PendingScrim, joinScrim: (scrim: PendingScrim)
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/scrims/ScrimTable.svelte**
  - props: lfs: boolean, scrims: PendingScrim[] | CurrentScrim[], joinScrim: (scrim: PendingScrim)
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/molecules/toasts/ToastContainer.svelte**
  - props: showTestButton
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/CreateLFSScrimModal.svelte**
  - props: visible
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/CreateScrimModal.svelte**
  - props: visible, lfs
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/JoinScrimModal.svelte**
  - props: visible, scrim: PendingScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/ManuallyExpireRestrictionModal.svelte**
  - props: visible: boolean, restriction: MemberRestriction
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/PlayerManagementModal.svelte**
  - props: visible, player: Player
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/RejectSubmissionModal.svelte**
  - props: visible: boolean, submissionId: string
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/ScrimManagementModal.svelte**
  - props: visible, targetScrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/SubmitReplaysModal.svelte**
  - props: visible: boolean, submissionId: string | undefined
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/modals/UploadReplaysModal.svelte**
  - props: visible: boolean, submissionId: string
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/QueuedSubViews/InProgressView.svelte**
  - props: scrim: CurrentScrim, submission: Submission | undefined
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/QueuedSubViews/LockedView.svelte**
  - props: scrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/QueuedSubViews/PendingView.svelte**
  - props: scrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/scrims/QueuedSubViews/PoppedView.svelte**
  - props: scrim: CurrentScrim
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/submissions/RatificationView.svelte**
  - props: submission: Submission
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/submissions/SubmissionProgressView.svelte**
  - props: submission: Submission
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none
- **clients/web/src/lib/components/organisms/submissions/SubmissionView.svelte**
  - props: submission: Submission
  - exported values: none
  - exported functions: none
  - export aliases: none
  - emitted events: none
  - slots: none

### other


