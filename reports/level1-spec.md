# Sprocket Level 1 Spec: Module/Class/API Surface

This document captures exported classes/modules and their public API surface from TypeScript source in backend/runtime workspaces.

- Generated from: `reports/level1-public-api.json`
- Scope: `core`, `common`, `clients/discord-bot`, `microservices/*`
- Excludes: test/fixture files and barrel `index.ts` files

## Workspace: core

- Files parsed: 309
- Exported entities: 371
- Module classes: 32
- Runtime classes: 113
- Data/interface entities: 226

### Module Definitions

- **AppModule** (core/src/app.module.ts)
  - imports: GraphQLModule.forRoot(...), BullModule.forRoot(...), OrganizationModule, IdentityModule, DatabaseModule, ConfigurationModule, GameModule, ReplayParseModule, ScrimModule, AuthModule, SchedulingModule, MledbInterfaceModule, FranchiseModule, ImageGenerationModule, SprocketRatingModule, UtilModule, EloModule, SubmissionModule, NotificationModule
  - providers: none
  - controllers: none
  - exports: none
- **ConfigurationModule** (core/src/configuration/configuration.module.ts)
  - imports: DatabaseModule, forwardRef(...)
  - providers: OrganizationConfigurationResolver, OrganizationConfigurationService, SprocketConfigurationResolver, SprocketConfigurationService
  - controllers: OrganizationConfigurationController, SprocketConfigurationController
  - exports: OrganizationConfigurationService
- **AuthorizationModule** (core/src/database/authorization/authorization.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **ConfigurationModule** (core/src/database/configuration/configuration.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **DatabaseModule** (core/src/database/database.module.ts)
  - imports: modules
  - providers: none
  - controllers: none
  - exports: modules
- **DraftModule** (core/src/database/draft/draft.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **FranchiseModule** (core/src/database/franchise/franchise.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **GameModule** (core/src/database/game/game.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **IdentityModule** (core/src/database/identity/identity.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **ImageGenModule** (core/src/database/image-gen/image-gen.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **MledbBridgeModule** (core/src/database/mledb-bridge/mledb_bridge.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **MledbModule** (core/src/database/mledb/mledb.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **OrganizationModule** (core/src/database/organization/organization.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **SchedulingModule** (core/src/database/scheduling/scheduling.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **ServiceNotificationsModule** (core/src/database/service-notifications/service-notifications.module.ts)
  - imports: none
  - providers: GlobalEntitySubscriberService
  - controllers: none
  - exports: none
- **WebhookModule** (core/src/database/webhook/webhook.module.ts)
  - imports: ormModule
  - providers: none
  - controllers: none
  - exports: ormModule
- **EloConnectorModule** (core/src/elo/elo-connector/elo-connector.module.ts)
  - imports: BullModule.forRoot(...), BullModule.registerQueue(...), AnalyticsModule
  - providers: EloConnectorService, EloConnectorConsumer
  - controllers: none
  - exports: EloConnectorService
- **EloModule** (core/src/elo/elo.module.ts)
  - imports: BullModule.registerQueue(...), BullModule.registerQueue(...), DatabaseModule, GameModule, OrganizationModule, EloConnectorModule, FranchiseModule, RedisModule, EventsModule, NotificationModule, IdentityModule, AnalyticsModule
  - providers: EloConsumer, EloResolver, EloService
  - controllers: none
  - exports: none
- **FranchiseModule** (core/src/franchise/franchise.module.ts)
  - imports: DatabaseModule, UtilModule, NotificationModule, EventsModule, GameModule, forwardRef(...), forwardRef(...), EloConnectorModule, AnalyticsModule, JwtModule.register(...)
  - providers: PlayerService, GameSkillGroupService, GameSkillGroupResolver, FranchiseService, FranchiseResolver, FranchiseProfileResolver, PlayerResolver, TeamService
  - controllers: FranchiseController, GameSkillGroupController, PlayerController
  - exports: PlayerService, FranchiseService, GameSkillGroupService, TeamService
- **GameModule** (core/src/game/game.module.ts)
  - imports: DatabaseModule
  - providers: GameService, GameModeService, PlatformService, GameResolver, GameModeResolver, GameFeatureService, GameFeatureResolver
  - controllers: GameController, GameModeController
  - exports: PlatformService, GameModeService, GameService, GameFeatureService
- **AuthModule** (core/src/identity/auth/auth.module.ts)
  - imports: IdentityModule, PassportModule, JwtModule.register(...), AnalyticsModule, forwardRef(...), forwardRef(...), forwardRef(...), forwardRef(...)
  - providers: GqlJwtGuard, OauthService, JwtStrategy, JwtRefreshStrategy, GoogleStrategy, DiscordStrategy
  - controllers: OauthController
  - exports: OauthService
- **IdentityModule** (core/src/identity/identity.module.ts)
  - imports: DatabaseModule, UtilModule, JwtModule.register(...)
  - providers: IdentityService, UserResolver, UserAuthenticationAccountResolver, UserService
  - controllers: IdentityController, UserController
  - exports: IdentityService, UserService
- **ImageGenerationModule** (core/src/image-generation/image-generation.module.ts)
  - imports: DatabaseModule, IGModule
  - providers: ImageGenerationService, ImageGenerationResolver
  - controllers: ImageGenerationController
  - exports: ImageGenerationService
- **MledbInterfaceModule** (core/src/mledb/mledb-interface.module.ts)
  - imports: DatabaseModule, GameModule, MatchmakingModule, SprocketRatingModule, UtilModule, forwardRef(...), forwardRef(...), forwardRef(...), forwardRef(...)
  - providers: MledbPlayerService, MledbPlayerAccountService, MledbFinalizationService, MledbMatchService
  - controllers: MledbMatchController, MledbPlayerController
  - exports: MledbMatchService, MledbPlayerService, MledbPlayerAccountService, MledbFinalizationService
- **NotificationModule** (core/src/notification/notification.module.ts)
  - imports: CommonNotificationModule
  - providers: NotificationService, NotificationResolver
  - controllers: none
  - exports: none
- **OrganizationModule** (core/src/organization/organization.module.ts)
  - imports: DatabaseModule, GameModule, forwardRef(...), AnalyticsModule, EventsModule, forwardRef(...), forwardRef(...), forwardRef(...), UtilModule
  - providers: OrganizationResolver, OrganizationService, MemberService, {...}, PronounsService, MemberFixService, MemberPlatformAccountService, MemberRestrictionService, MemberRestrictionResolver, QueueBanGuard, MemberResolver, MemberModResolver
  - controllers: OrganizationController, MemberController
  - exports: MemberResolver, MemberService, MemberPlatformAccountService, MemberRestrictionService, QueueBanGuard, OrganizationService
- **ReplayParseModule** (core/src/replay-parse/replay-parse.module.ts)
  - imports: SubmissionModule, CeleryModule, MinioModule, RedisModule, MatchmakingModule, ScrimModule, EventsModule, DatabaseModule, MledbInterfaceModule, AnalyticsModule, FranchiseModule, IdentityModule, SprocketRatingModule, EloModule, EloConnectorModule, SchedulingModule, UtilModule, OrganizationModule
  - providers: ReplayParseModResolver, ReplayParseService, {...}, ReplaySubmissionResolver, SubmissionRejectionResolver, BallchasingConverterService, CarballConverterService, FinalizationSubscriber, RocketLeagueFinalizationService
  - controllers: none
  - exports: none
- **SchedulingModule** (core/src/scheduling/scheduling.module.ts)
  - imports: UtilModule, DatabaseModule, EloConnectorModule, forwardRef(...), forwardRef(...), EventsModule, SubmissionModule
  - providers: MatchService, RoundService, ScheduleGroupModResolver, ScheduleGroupResolver, ScheduleGroupService, ScheduleGroupTypeService, ScheduleFixtureService, ScheduleFixtureResolver, MatchResolver, MatchParentResolver, MatchPlayerGuard, EligibilityService
  - controllers: MatchController
  - exports: MatchService, RoundService, EligibilityService
- **ScrimModule** (core/src/scrim/scrim.module.ts)
  - imports: UtilModule, ConfigurationModule, MatchmakingModule, EventsModule, GameModule, AuthModule, RedisModule, SchedulingModule, MatchmakingModule, DatabaseModule, OrganizationModule, FranchiseModule, MledbInterfaceModule, EloConnectorModule, BullModule.registerQueue(...)
  - providers: ScrimModuleResolver, ScrimModuleResolverPublic, {...}, ScrimConsumer, ScrimService, ScrimResolver, MatchService, RoundService, ScrimMetricsResolver, ScrimMetaCrudService, ScrimManagementResolver, ScrimToggleService, ScrimToggleResolver
  - controllers: ScrimController
  - exports: ScrimService
- **SprocketRatingModule** (core/src/sprocket-rating/sprocket-rating.module.ts)
  - imports: none
  - providers: SprocketRatingService
  - controllers: none
  - exports: SprocketRatingService
- **SubmissionModule** (core/src/submission/submission.module.ts)
  - imports: CommonSubmissionModule
  - providers: SubmissionManagementResolver, SubmissionService
  - controllers: none
  - exports: none
- **UtilModule** (core/src/util/util.module.ts)
  - imports: DatabaseModule
  - providers: PopulateService
  - controllers: none
  - exports: PopulateService

### Runtime Classes (Public Methods)

#### Context: configuration

- **OrganizationConfigurationController** (controller; core/src/configuration/organization-configuration/organization-configuration.controller.ts)
  - decorators: Controller
  - dependencies: organizationConfigurationService: OrganizationConfigurationService
  - public methods: getOrganizationConfigurationValue(payload: unknown): Promise<OrganizationConfigurationKeyTypes[keyof OrganizationConfigurationKeyTypes]> [MessagePattern]
- **OrganizationConfigurationResolver** (resolver; core/src/configuration/organization-configuration/organization-configuration.resolver.ts)
  - decorators: Resolver
  - dependencies: ocService: OrganizationConfigurationService
  - public methods: getOrganizationConfigurations(organizationId: number, key?: OrganizationConfigurationKeyCode): Promise<OrganizationConfiguration[]> [Query]
- **OrganizationConfigurationService** (service; core/src/configuration/organization-configuration/organization-configuration.service.ts)
  - decorators: Injectable
  - dependencies: organizationRepository: Repository<Organization>, keyRepository: Repository<OrganizationConfigurationKey>, allowedValueRepository: Repository<OrganizationConfigurationAllowedValue>, valueRepository: Repository<OrganizationConfigurationValue>
  - public methods: getOrganizationConfigurations(organizationId: number, code?: OrganizationConfigurationKeyCode): Promise<OrganizationConfiguration[]>, getOrganizationConfigurationKeys(): Promise<OrganizationConfigurationKey[]>, getOrganizationConfigurationAllowedValues(code: OrganizationConfigurationKeyCode): Promise<OrganizationConfigurationAllowedValue[]>, getOrganizationConfigurationValue(organizationId: number, code: OrganizationConfigurationKeyCode): Promise<T>, findOrganizationConfigurationValue(value: string, options?: FindOneOptions<OrganizationConfigurationValue>): Promise<OrganizationConfigurationValue>, createOrganizationConfigurationValue(organizationId: number, code: OrganizationConfigurationKeyCode, value: string): Promise<OrganizationConfigurationValue>, updateOrganizationConfigurationValue(organizationId: number, code: OrganizationConfigurationKeyCode, newValue: string): Promise<OrganizationConfigurationValue>, validateValue(value: string, allowedValues: OrganizationConfigurationAllowedValue[]): boolean, parseValue(key: OrganizationConfigurationKey, value: string): OrganizationConfigurationKeyTypes[keyof OrganizationConfigurationKeyTypes]
- **SprocketConfigurationController** (controller; core/src/configuration/sprocket-configuration/sprocket-configuration.controller.ts)
  - decorators: Controller
  - dependencies: sprocketConfigService: SprocketConfigurationService
  - public methods: getSprocketConfiguration(payload: unknown): Promise<SprocketConfiguration[]> [MessagePattern]
- **SprocketConfigurationResolver** (resolver; core/src/configuration/sprocket-configuration/sprocket-configuration.resolver.ts)
  - decorators: Resolver
  - dependencies: service: SprocketConfigurationService
  - public methods: getSprocketConfiguration(key?: string): Promise<SprocketConfiguration[]> [Query]
- **SprocketConfigurationService** (service; core/src/configuration/sprocket-configuration/sprocket-configuration.service.ts)
  - decorators: Injectable
  - dependencies: sprocketConfigurationRepository: Repository<SprocketConfiguration>
  - public methods: getSprocketConfiguration(key?: string): Promise<SprocketConfiguration[]>
- **VerbiageService** (service; core/src/configuration/verbiage/verbiage.service.ts)
  - decorators: Injectable
  - dependencies: verbiageRepository: Repository<Verbiage>, verbiageCodeRepository: Repository<VerbiageCode>, organizationService: OrganizationService
  - public methods: upsertVerbiage(term: string, organizationId: number, verbiageCode: string): Promise<Verbiage>, getVerbiage(organizationId: number, code: string): Promise<string>, deleteVerbiage(organizationId: number, code: VerbiageCode): Promise<Verbiage>

#### Context: database

- **GlobalEntitySubscriberService** (service; core/src/database/service-notifications/global-entity-subscriber/global-entity-subscriber.service.ts)
  - decorators: EventSubscriber
  - dependencies: clientProxy: ClientProxy
  - public methods: afterInsert(event: InsertEvent<unknown>): void, beforeUpdate(event: UpdateEvent<unknown>): void, afterRemove(event: RemoveEvent<unknown>): void

#### Context: elo

- **EloConnectorConsumer** (consumer; core/src/elo/elo-connector/elo-connector.consumer.ts)
  - decorators: Processor
  - dependencies: eloConnectorService: EloConnectorService, analyticsService: AnalyticsService
  - public methods: onCompleted(job: JobId, result: string): Promise<void> [OnGlobalQueueCompleted], onFailed(job: JobId, e: Error): Promise<void> [OnGlobalQueueFailed]
- **EloConnectorService** (service; core/src/elo/elo-connector/elo-connector.service.ts)
  - decorators: Injectable
  - dependencies: eloQueue: Queue
  - public methods: createJob(endpoint: E, data: EloInput<E>): Promise<JobId>, createJobAndWait(endpoint: E, data: EloInput<E>): Promise<EloOutput<E>>, getJobListener(jobId: JobId): JobListenerPayload | undefined
- **EloConsumer** (consumer; core/src/elo/elo.consumer.ts)
  - decorators: Processor
  - dependencies: eloQueue: Queue, playerService: PlayerService, gameService: GameService, gameFeatureService: GameFeatureService, organizationService: OrganizationService, eloConnectorService: EloConnectorService, analyticsService: AnalyticsService
  - public methods: onFailure(job: Job, error: Error): Promise<void> [OnQueueFailed], runSalaries(): Promise<void> [Process], compactGraph(): Promise<void>, onApplicationBootstrap(): Promise<void>
- **EloResolver** (resolver; core/src/elo/elo.resolver.ts)
  - decorators: Resolver
  - dependencies: eloService: EloService, eloConnectorService: EloConnectorService, eloConsumer: EloConsumer, ds: DataSource
  - public methods: generateMigrationData(): Promise<string> [Mutation, UseGuards], runEloMigration(): Promise<string> [Mutation, UseGuards], reinitEloDb(): Promise<boolean> [Mutation, UseGuards], runSalaries(): Promise<boolean> [Mutation, UseGuards], compactGraph(): Promise<boolean> [Mutation, UseGuards]
- **EloService** (service; core/src/elo/elo.service.ts)
  - decorators: Injectable
  - dependencies: dataSource: DataSource
  - public methods: prepMigrationData(): Promise<NewPlayer[]>, skillGroupStringToInt(skillGroup: string): number

#### Context: franchise

- **FranchiseProfileResolver** (resolver; core/src/franchise/franchise-profile/franchise-profile.resolver.ts)
  - decorators: Resolver
  - dependencies: popService: PopulateService
  - public methods: photo(root: FranchiseProfile): Promise<Photo | undefined> [ResolveField], franchise(root: FranchiseProfile): Promise<Franchise> [ResolveField]
- **FranchiseController** (controller; core/src/franchise/franchise/franchise.controller.ts)
  - decorators: Controller
  - dependencies: franchiseService: FranchiseService
  - public methods: getFranchiseProfile(payload: unknown): Promise<FranchiseProfile> [MessagePattern], getPlayerFranchises(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> [MessagePattern]
- **FranchiseResolver** (resolver; core/src/franchise/franchise/franchise.resolver.ts)
  - decorators: Resolver
  - dependencies: populate: PopulateService
  - public methods: profile(root: Franchise): Promise<FranchiseProfile> [ResolveField], organization(root: Franchise): Promise<Organization> [ResolveField]
- **FranchiseService** (service; core/src/franchise/franchise/franchise.service.ts)
  - decorators: Injectable
  - dependencies: franchiseRepository: Repository<Franchise>, mledbPlayerService: MledbPlayerService, sprocketMemberService: MemberService, franchiseProfileRepository: Repository<FranchiseProfile>
  - public methods: getFranchiseProfile(franchiseId: number): Promise<FranchiseProfile>, getFranchiseById(franchiseId: number): Promise<Franchise>, getFranchise(query: FindOneOptions<Franchise>): Promise<Franchise>, getFranchiseByName(name: string): Promise<Franchise>, getPlayerFranchisesByUserId(userId: number): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>>
- **GameSkillGroupController** (controller; core/src/franchise/game-skill-group/game-skill-group.controller.ts)
  - decorators: Controller
  - dependencies: gameSkillGroupService: GameSkillGroupService
  - public methods: getGameSkillGroupProfile(payload: unknown): Promise<GameSkillGroupProfile> [MessagePattern], getSkillGroupWebhooks(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetSkillGroupWebhooks>> [MessagePattern]
- **GameSkillGroupResolver** (resolver; core/src/franchise/game-skill-group/game-skill-group.resolver.ts)
  - decorators: Resolver
  - dependencies: popService: PopulateService
  - public methods: profile(root: GameSkillGroup): Promise<GameSkillGroupProfile> [ResolveField], game(root: GameSkillGroup): Promise<Game> [ResolveField], players(root: GameSkillGroup): Promise<Player[]> [ResolveField]
- **GameSkillGroupService** (service; core/src/franchise/game-skill-group/game-skill-group.service.ts)
  - decorators: Injectable
  - dependencies: gameSkillGroupRepository: Repository<GameSkillGroup>, gameSkillGroupProfileRepository: Repository<GameSkillGroupProfile>
  - public methods: getGameSkillGroup(query: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup>, getGameSkillGroupById(id: number, options?: FindOneOptions<GameSkillGroup>): Promise<GameSkillGroup>, getGameSkillGroupProfile(skillGroupId: number): Promise<GameSkillGroupProfile>, getGameSkillGroupByMLEDBLeague(league: League): Promise<GameSkillGroup>, getSkillGroupWebhooks(skillGroupId: number): Promise<CoreOutput<CoreEndpoint.GetSkillGroupWebhooks>>
- **PlayerController** (controller; core/src/franchise/player/player.controller.ts)
  - decorators: Controller
  - dependencies: eloConnectorService: EloConnectorService, jwtService: JwtService, playerService: PlayerService, skillGroupService: GameSkillGroupService, eventsService: EventsService, notificationService: NotificationService, gameService: GameService, platformService: PlatformService, userAuthRepository: Repository<UserAuthenticationAccount>, organizationService: OrganizationService
  - public methods: acceptRankdown(token: string): Promise<string> [Get], getPlayerByPlatformId(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> [MessagePattern], getPlayersByPlatformIds(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayersByPlatformIds>> [MessagePattern]
- **PlayerGuard** (service; core/src/franchise/player/player.guard.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: canActivate(context: ExecutionContext): Promise<boolean>, getGameAndOrganization(ctx: GraphQLExecutionContext, userPayload?: UserPayload): Promise<GameAndOrganization>
- **IntakePlayerAccount** (resolver; core/src/franchise/player/player.resolver.ts)
  - decorators: InputType
  - dependencies: none
  - public methods: none
- **PlayerResolver** (resolver; core/src/franchise/player/player.resolver.ts)
  - decorators: Resolver
  - dependencies: popService: PopulateService, playerService: PlayerService, franchiseService: FranchiseService, skillGroupService: GameSkillGroupService, eventsService: EventsService, notificationService: NotificationService, eloConnectorService: EloConnectorService, userAuthRepository: Repository<UserAuthenticationAccount>, organizationService: OrganizationService
  - public methods: skillGroup(player: Player): Promise<GameSkillGroup> [ResolveField], franchiseName(player: Player): Promise<string> [ResolveField], franchisePositions(player: Player): Promise<string[]> [ResolveField], member(player: Player): Promise<Member> [ResolveField], changePlayerSkillGroupBulk(files: Array<Promise<FileUpload>>): Promise<typeof ChangePlayerSkillGroupResult> [Mutation, UseGuards], changePlayerSkillGroup(playerId: number, salary: number, skillGroupId: number, silent?: boolean): Promise<typeof ChangePlayerSkillGroupResult> [Mutation, UseGuards], createPlayer(memberId: number, skillGroupId: number, salary: number): Promise<typeof CreatePlayerResult> [Mutation, UseGuards], intakeUserBulk(files: Array<Promise<FileUpload>>): Promise<string[]> [Mutation, UseGuards], intakeUser(name: string, d_id: string, ptl: CreatePlayerTuple[]): Promise<typeof IntakeUserResult> [Mutation, UseGuards], swapDiscordAccounts(newAcct: string, oldAcct: string): Promise<typeof SwapDiscordAccountsResult> [Mutation, UseGuards], forcePlayerToTeam(mleid: number, newTeam: string): Promise<typeof ForcePlayerToTeamResult> [Mutation, UseGuards], changePlayerName(mleid: number, newName: string): Promise<typeof ChangePlayerNameResult> [Mutation, UseGuards]
- **PlayerService** (service; core/src/franchise/player/player.service.ts)
  - decorators: Injectable
  - dependencies: playerRepository: Repository<Player>, userRepository: Repository<User>, userProfileRepository: Repository<UserProfile>, memberRepository: Repository<Member>, memberProfileRepository: Repository<MemberProfile>, userAuthRepository: Repository<UserAuthenticationAccount>, organizationRepository: Repository<Organization>, ptpRepo: Repository<PlayerToPlayer>, mle_playerRepository: Repository<MLE_Player>, memberService: MemberService, organizationService: OrganizationService, skillGroupService: GameSkillGroupService, eventsService: EventsService, notificationService: NotificationService, jwtService: JwtService, dataSource: DataSource, eloConnectorService: EloConnectorService, platformService: PlatformService, analyticsService: AnalyticsService
  - public methods: getPlayer(query: FindOneOptions<Player>): Promise<Player>, getPlayerById(id: number): Promise<Player>, getPlayerByOrganizationAndGame(userId: number, organizationId: number, gameId: number): Promise<Player>, getPlayerByOrganizationAndGameMode(userId: number, organizationId: number, gameModeId: number): Promise<Player>, getPlayers(query?: FindManyOptions<Player>): Promise<Player[]>, createPlayer(memberOrId: number | Member, skillGroupId: number, salary: number, runner?: QueryRunner): Promise<Player>, checkAndCreateMlePlayer(player: Player, userId: number, skillGroupId: number, runner?: QueryRunner): Promise<void>, updatePlayer(mleid: number, name: string, skillGroupId: number, salary: number, platform: string, timezone: Timezone, modePreference: ModePreference): Promise<Player>, mle_updatePlayer(player: MLE_Player, name: string, league: League, salary: number, platform: string, timezone: Timezone, preference: ModePreference, runner?: QueryRunner): Promise<MLE_Player>, mle_createPlayer(sprocketPlayerId: number, discordId: string, name: string, salary: number, league: League, platform: string, timezone: Timezone, preference: ModePreference, runner?: QueryRunner): Promise<MLE_Player>, updatePlayerStanding(playerId: number, salary: number, skillGroupId?: number): Promise<Player>, buildRankdownNotification(userId: number, discordId: string, orgId: number, orgName: string, oldSkillGroupName: string, newSkillGroupName: string, salary: number): NotificationInput<NotificationEndpoint.SendNotification>, saveSalaries(payload: SalaryPayloadItem[][]): Promise<void>, mle_nextLeague(league: League, dir: -1 | 1): League, mle_movePlayerToLeague(sprocPlayerId: number, salary: number, skillGroupId: number): Promise<MLE_Player>, mle_rankDownPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player>, mle_rankUpPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player>, getMlePlayerBySprocketPlayer(playerId: number): Promise<MLE_Player>, getPlayerByGameAndPlatform(gameId: number, platformId: number, platformAccountId: string, relations?: FindOptionsRelations<Player>): Promise<Player>, getPlayerByGameAndPlatformPayload(data: { platform: string; platformId: string; gameId: number; }): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>>, intakeUser(name: string, d_id: string, ptl: CreatePlayerTuple[]): Promise<string | Player | User>, swapDiscordAccounts(newAcct: string, oldAcct: string): Promise<void>, forcePlayerToTeam(mleid: number, newTeam: string): Promise<void>, changePlayerName(mleid: number, newName: string): Promise<void>
- **TeamService** (service; core/src/franchise/team/team.service.ts)
  - decorators: Injectable
  - dependencies: teamRepo: Repository<Team>
  - public methods: getTeam(franchiseId: number, gameSkillGroupId: number): Promise<Team>

#### Context: game

- **GameFeatureResolver** (resolver; core/src/game/game_feature/game_feature.resolver.ts)
  - decorators: Resolver
  - dependencies: gameFeatureService: GameFeatureService
  - public methods: getFeatureEnabled(user: UserPayload, code: FeatureCode, gameId: number): Promise<boolean> [Query, UseGuards], enableFeature(user: UserPayload, code: FeatureCode, gameId: number): Promise<EnabledFeature> [Mutation, UseGuards], disableFeature(user: UserPayload, code: FeatureCode, gameId: number): Promise<EnabledFeature> [Mutation, UseGuards]
- **GameFeatureService** (service; core/src/game/game_feature/game_feature.service.ts)
  - decorators: Injectable
  - dependencies: gameFeatureRepository: Repository<GameFeature>, enabledFeatureRepository: Repository<EnabledFeature>, organizationRepository: Repository<Organization>
  - public methods: featureIsEnabled(code: FeatureCode, gameId: number, organizationId: number): Promise<boolean>, enableFeature(code: FeatureCode, gameId: number, organizationId: number): Promise<EnabledFeature>, disableFeature(code: FeatureCode, gameId: number, organizationId: number): Promise<EnabledFeature>
- **GameModeController** (controller; core/src/game/game-mode/game-mode.controller.ts)
  - decorators: Controller
  - dependencies: gameModeService: GameModeService
  - public methods: getGameModeById(payload: unknown): Promise<GameMode> [MessagePattern]
- **GameModeResolver** (resolver; core/src/game/game-mode/game-mode.resolver.ts)
  - decorators: Resolver
  - dependencies: gameService: GameService
  - public methods: game(root: Partial<GameMode>): Promise<Game> [ResolveField]
- **GameModeService** (service; core/src/game/game-mode/game-mode.service.ts)
  - decorators: Injectable
  - dependencies: gameModeRepository: Repository<GameMode>
  - public methods: getGameModeById(id: number, options?: FindOneOptions<GameMode>): Promise<GameMode>, getGameModes(query: FindManyOptions<GameMode>): Promise<GameMode[]>
- **GameController** (controller; core/src/game/game/game.controller.ts)
  - decorators: Controller
  - dependencies: gameModeService: GameModeService
  - public methods: getGameByGameMode(payload: unknown): Promise<GetGameByGameModeResponse> [MessagePattern]
- **GameResolver** (resolver; core/src/game/game/game.resolver.ts)
  - decorators: Resolver
  - dependencies: gameService: GameService, gameModeService: GameModeService
  - public methods: getGame(title: string): Promise<Game> [Query], getGames(): Promise<Game[]> [Query], modes(root: Game): Promise<GameMode[]> [ResolveField]
- **GameService** (service; core/src/game/game/game.service.ts)
  - decorators: Injectable
  - dependencies: gameRepository: Repository<Game>
  - public methods: getGameByTitle(title: string): Promise<Game>, getGameById(id: number): Promise<Game>, getGames(query?: FindManyOptions<Game>): Promise<Game[]>, getGame(query: FindOneOptions<Game>): Promise<Game>
- **PlatformService** (service; core/src/game/platform/platform.service.ts)
  - decorators: Injectable
  - dependencies: platformRepository: Repository<Platform>
  - public methods: getPlatformById(id: number, manager?: EntityManager): Promise<Platform>, getPlatformByCode(code: string, manager?: EntityManager): Promise<Platform>, getPlatforms(): Promise<Platform[]>, createPlatform(code: string): Promise<Platform>

#### Context: identity

- **DiscordAuthGuard** (service; core/src/identity/auth/oauth/guards/discord-auth.guard.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none
- **GoogleAuthGuard** (service; core/src/identity/auth/oauth/guards/google-auth.guard.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none
- **JwtAuthGuard** (service; core/src/identity/auth/oauth/guards/jwt-auth.guard.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none
- **JwtRefreshGuard** (service; core/src/identity/auth/oauth/guards/jwt-refresh.guard.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none
- **RolesGuard** (service; core/src/identity/auth/oauth/guards/roles.guard.ts)
  - decorators: Injectable
  - dependencies: reflector: Reflector, jwtService: JwtService, userService: UserService
  - public methods: matchRoles(roles: string[], userroles: string[]): boolean, fromHeaderOrQueryString(req: Req): string, canActivate(context: ExecutionContext): Promise<boolean>
- **OauthController** (controller; core/src/identity/auth/oauth/oauth.controller.ts)
  - decorators: Controller
  - dependencies: authService: OauthService, userService: UserService, mledbUserService: MledbPlayerService
  - public methods: discordAuthRedirect(req: Req, res: Res): Promise<void> [Get, Get, UseGuards], refreshTokens(req: Req): Promise<AccessToken> [UseGuards, Get]
- **OauthService** (service; core/src/identity/auth/oauth/oauth.service.ts)
  - decorators: Injectable
  - dependencies: jwtService: JwtService
  - public methods: login(user: AuthPayload): Promise<AccessToken>, loginDiscord(user: AuthPayload): Promise<AccessToken>, refreshTokens(user: AuthPayload, refreshToken: string): Promise<AccessToken>
- **IdentityController** (controller; core/src/identity/identity.controller.ts)
  - decorators: Controller
  - dependencies: identityService: IdentityService, userService: UserService
  - public methods: getUserByAuthAccount(payload: unknown): Promise<GetUserByAuthAccountResponse> [MessagePattern]
- **IdentityService** (service; core/src/identity/identity.service.ts)
  - decorators: Injectable
  - dependencies: userAuthAccountRepository: Repository<UserAuthenticationAccount>, userRepository: Repository<User>
  - public methods: registerUser(accountType: AccountType, accountId: string): Promise<User>, getUserByAuthAccount(accountType: AccountType, accountId: string): Promise<User>, getAuthAccountsForUser(userId: number): Promise<UserAuthenticationAccount[]>
- **UserAuthenticationAccountResolver** (resolver; core/src/identity/user-authentication-account/user-authentication-account.resolver.ts)
  - decorators: Resolver
  - dependencies: identityService: IdentityService
  - public methods: user(authenticationAccount: Partial<UserAuthenticationAccount>): Promise<User> [ResolveField]
- **UserController** (controller; core/src/identity/user/user.controller.ts)
  - decorators: Controller
  - dependencies: userService: UserService
  - public methods: getDiscordIdByUser(payload: unknown): Promise<string | undefined> [MessagePattern]
- **UserResolver** (resolver; core/src/identity/user/user.resolver.ts)
  - decorators: Resolver
  - dependencies: identityService: IdentityService, userService: UserService, popService: PopulateService, jwtService: JwtService
  - public methods: me(cu: UserPayload): Promise<User> [Query, UseGuards], getUserByAuthAccount(accountId: string, accountType: UserAuthenticationAccountType): Promise<User | null> [Query], registerUser(accountId: string, accountType: UserAuthenticationAccountType): Promise<User> [Mutation], authenticationAccounts(user: Partial<User>): Promise<UserAuthenticationAccount[]> [ResolveField], profile(user: Partial<User>): Promise<UserProfile> [ResolveField], members(user: User, orgId?: number): Promise<Member[]> [ResolveField], loginAsUser(authedUser: UserPayload, userId: number, organizationId?: number): Promise<string> [UseGuards, Mutation]
- **UserService** (service; core/src/identity/user/user.service.ts)
  - decorators: Injectable
  - dependencies: userRepository: Repository<User>, userProfileRepository: Repository<UserProfile>, userAuthAcctRepository: Repository<UserAuthenticationAccount>
  - public methods: createUser(userProfile: Omit<UserProfile, IrrelevantFields | "id" | "user">, authenticationAccounts: Array< Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> >): Promise<User>, addAuthenticationAccounts(id: number, authenticationAccounts: Array< Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> >): Promise<User>, getUserAuthenticationAccountsForUser(userId: number): Promise<UserAuthenticationAccount[]>, getUserDiscordAccount(userId: number): Promise<UserAuthenticationAccount>, getUserById(id: number, options?: FindOneOptions<User>): Promise<User>, getUser(query: FindOneOptions<UserProfile>): Promise<User | undefined>, getUsers(query: FindManyOptions<UserProfile>): Promise<User[]>, updateUserProfile(userId: number, data: Omit<Partial<UserProfile>, "user">): Promise<UserProfile>, deleteUser(id: number): Promise<User>, getUserProfileForUser(userId: number): Promise<UserProfile>

#### Context: image-generation

- **ImageGenerationController** (controller; core/src/image-generation/image-generation.controller.ts)
  - decorators: Controller
  - dependencies: imageGenerationService: ImageGenerationService
  - public methods: generateReportCard(payload: unknown): Promise<string> [MessagePattern]
- **ImageGenerationResolver** (resolver; core/src/image-generation/image-generation.resolver.ts)
  - decorators: Resolver
  - dependencies: imageGenerationService: ImageGenerationService
  - public methods: generateScrimReportCard(scrimId: number): Promise<string> [Mutation], generateSeriesReportCard(seriesId: number): Promise<string> [Mutation]
- **ImageGenerationService** (service; core/src/image-generation/image-generation.service.ts)
  - decorators: Injectable
  - dependencies: imageTemplateRepository: Repository<ImageTemplate>, dataSource: DataSource, igService: IGService
  - public methods: createScrimReportCard(scrimId: number): Promise<string>, createSeriesReportCard(seriesId: number): Promise<string>

#### Context: mledb

- **MledbMatchController** (controller; core/src/mledb/mledb-match/mledb-match.controller.ts)
  - decorators: Controller
  - dependencies: matchService: MledbMatchService
  - public methods: getMleMatchInfoAndStakeholders(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMleMatchInfoAndStakeholders>> [MessagePattern]
- **MledbMatchService** (service; core/src/mledb/mledb-match/mledb-match.service.ts)
  - decorators: Injectable
  - dependencies: fixtureRepo: Repository<MLE_Fixture>, teamRepo: Repository<MLE_Team>, seriesRepo: Repository<MLE_Series>, seriesReplayRepo: Repository<MLE_SeriesReplay>, teamCaptainRepo: Repository<MLE_TeamToCaptain>, sprocketMatchService: MatchService, popService: PopulateService
  - public methods: getMleSeries(awayName: string, homeName: string, matchStart: Date, seasonStart: Date, mode: LegacyGameMode, league: League): Promise<MLE_Series>, getMleMatchInfoAndStakeholders(sprocketMatchId: number): Promise<CoreOutput<CoreEndpoint.GetMleMatchInfoAndStakeholders>>, markSeriesNcp(seriesId: number, isNcp: boolean, winningTeamName?: string): Promise<string>, markReplaysNcp(replayIds: number[], isNcp: boolean, winningTeam?: MLE_Team): Promise<string>
- **MledbPlayerAccountService** (service; core/src/mledb/mledb-player-account/mledb-player-account.service.ts)
  - decorators: Injectable
  - dependencies: playerAccountRepository: Repository<MLE_PlayerAccount>
  - public methods: getPlayerAccounts(query: FindManyOptions<MLE_PlayerAccount>): Promise<MLE_PlayerAccount[]>, createOrUpdatePlayerAccount(updated_by_user_id: number, platform: MLE_Platform, tracker: string, platform_id: string, player: MLE_Player, manager?: EntityManager): Promise<void>
- **MledbPlayerController** (controller; core/src/mledb/mledb-player/mledb-player.controller.ts)
  - decorators: Controller
  - dependencies: playerRepository: Repository<MLE_Player>, teamRepository: Repository<MLE_Team>
  - public methods: getNicknameByDiscordUser(payload: unknown): Promise<string> [MessagePattern]
- **FormerPlayerScrimGuard** (service; core/src/mledb/mledb-player/mledb-player.guard.ts)
  - decorators: Injectable
  - dependencies: mledbPlayerService: MledbPlayerService
  - public methods: canActivate(context: ExecutionContext): Promise<boolean>
- **MledbPlayerService** (service; core/src/mledb/mledb-player/mledb-player.service.ts)
  - decorators: Injectable
  - dependencies: playerRepository: Repository<MLE_Player>, playerAccountRepository: Repository<MLE_PlayerAccount>, playerToOrgRepository: Repository<MLE_PlayerToOrg>, teamRepo: Repository<MLE_Team>, teamToCaptainRepo: Repository<MLE_TeamToCaptain>, userService: UserService, gameService: GameService
  - public methods: getPlayerByDiscordId(id: string): Promise<MLE_Player>, getPlayerOrgs(player: MLE_Player): Promise<MLE_PlayerToOrg[]>, getPlayerByPlatformId(platform: MLE_Platform, platformId: string): Promise<MLE_Player>, getMlePlayerBySprocketUser(userId: number): Promise<MLE_Player>, getPlayerFranchise(id: number): Promise<MLE_Team>, playerIsCaptain(id: number): Promise<boolean>, getTeamsWherePlayerIsStaff(playerId: number): Promise<MLE_Team[]>, getSprocketUserByPlatformInformation(platform: MLE_Platform, platformId: string): Promise<User>, getSprocketPlayerByPlatformInformation(platform: MLE_Platform, platformId: string): Promise<Player>
- **MledbFinalizationService** (service; core/src/mledb/mledb-scrim/mledb-finalization.service.ts)
  - decorators: Injectable
  - dependencies: mleSeriesReplayRepository: Repository<MLE_SeriesReplay>, mlePlayerAccountRepository: Repository<MLE_PlayerAccount>, mlePlayerRepository: Repository<MLE_Player>, skillGroupService: GameSkillGroupService, gameModeService: GameModeService, userService: UserService, sprocketRatingService: SprocketRatingService, mleMatchService: MledbMatchService
  - public methods: getLeagueAndMode(scrim: Scrim): Promise<{mode: GameMode; group: GameSkillGroup;}>, saveMatch(submission: MatchReplaySubmission, submissionId: string, em: EntityManager): Promise<MLE_Series>, saveScrim(submission: ScrimReplaySubmission | LFSReplaySubmission, submissionId: string, em: EntityManager, scrimObject: Scrim): Promise<MLE_Scrim>, saveSeries(submission: ReplaySubmission, submissionId: string, em: EntityManager, series: MLE_Series): Promise<number>, getScrimIdByBallchasingId(ballchasingId: string): Promise<number>, getMlePlayerByBallchasingPlayer(p: BallchasingPlayer): Promise<MLE_Player>

#### Context: notification

- **NotificationResolver** (resolver; core/src/notification/notification.resolver.ts)
  - decorators: Resolver
  - dependencies: none
  - public methods: none
- **NotificationService** (service; core/src/notification/notification.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none

#### Context: organization

- **MemberPlatformAccountService** (service; core/src/organization/member-platform-account/member-platform-account.service.ts)
  - decorators: Injectable
  - dependencies: memberPlatformAccountRepository: Repository<MemberPlatformAccount>, platformService: PlatformService
  - public methods: getMemberPlatformAccount(query: FindOneOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount>, getMemberPlatformAccountById(id: number): Promise<MemberPlatformAccount>, getMemberPlatformAccounts(query: FindManyOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount[]>, createMemberPlatformAccount(member: Member, platformId: number, platformAccountId: string, manager?: EntityManager): Promise<MemberPlatformAccount>
- **MemberRestrictionGuard** (service; core/src/organization/member-restriction/member-restriction.guard.ts)
  - decorators: Injectable
  - dependencies: memberRestrictionService: MemberRestrictionService, memberService: MemberService
  - public methods: canActivate(context: ExecutionContext): Promise<boolean>
- **QueueBanGuard** (guard; core/src/organization/member-restriction/member-restriction.guard.ts)
  - decorators: none
  - dependencies: none
  - public methods: none
- **RatificationBanGuard** (guard; core/src/organization/member-restriction/member-restriction.guard.ts)
  - decorators: none
  - dependencies: none
  - public methods: none
- **MemberRestrictionResolver** (resolver; core/src/organization/member-restriction/member-restriction.resolver.ts)
  - decorators: Resolver
  - dependencies: memberRestrictionService: MemberRestrictionService, memberService: MemberService, pubSub: PubSub
  - public methods: getActiveMemberRestrictions(type: MemberRestrictionType): Promise<MemberRestriction[]> [Query, UseGuards], createMemberRestriction(type: MemberRestrictionType, expiration: Date, reason: string, memberId: number): Promise<MemberRestriction> [Mutation, UseGuards], manuallyExpireMemberRestriction(id: number, manualExpiration: Date, manualExpirationReason: string, forgiven: boolean): Promise<MemberRestriction> [Mutation, UseGuards], member(memberRestriction: Partial<MemberRestriction>): Promise<Member> [ResolveField], followRestrictedMembers(): Promise<AsyncIterator<MemberRestrictionEvent>> [Subscription]
- **MemberRestrictionService** (service; core/src/organization/member-restriction/member-restriction.service.ts)
  - decorators: Injectable
  - dependencies: memberRestrictionRepository: Repository<MemberRestriction>, memberService: MemberService, eventsService: EventsService
  - public methods: createMemberRestriction(type: MemberRestrictionType, expiration: Date, reason: string, memberId: number): Promise<MemberRestriction>, getMemberRestrictionById(id: number, options?: FindOneOptions<MemberRestriction>): Promise<MemberRestriction>, getMemberRestrictions(query: FindManyOptions<MemberRestriction>): Promise<MemberRestriction[]>, getActiveMemberRestrictions(type: MemberRestrictionType, date: Date, memberId?: number): Promise<MemberRestriction[]>, manuallyExpireMemberRestriction(memberRestrictionId: number, manualExpiration: Date, manualExpirationReason: string, forgiven: boolean): Promise<MemberRestriction>
- **MemberController** (controller; core/src/organization/member/member.controller.ts)
  - decorators: Controller
  - dependencies: memberService: MemberService
  - public methods: getMember(payload: unknown): Promise<GetMemberResponse> [MessagePattern]
- **MemberModResolver** (resolver; core/src/organization/member/member.mod.resolver.ts)
  - decorators: Resolver
  - dependencies: memberPlatformAccountService: MemberPlatformAccountService, platformService: PlatformService, mledbPlayerService: MledbPlayerService, mledbPlayerAccountService: MledbPlayerAccountService, memberFixService: MemberFixService, dataSource: DataSource, analyticsService: AnalyticsService
  - public methods: reportMemberPlatformAccount(cu: UserPayload, userId: number, organizationId: number, tracker: string, platform: string, platformId: string): Promise<string> [Mutation, UseGuards], relinkPlatformAccount(sprocketUserId: string, platformId: string): Promise<string> [Mutation]
- **MemberResolver** (resolver; core/src/organization/member/member.resolver.ts)
  - decorators: Resolver
  - dependencies: memberService: MemberService, popService: PopulateService
  - public methods: profile(member: Member): Promise<MemberProfile> [ResolveField], organization(member: Member): Promise<Organization> [ResolveField], players(member: Member): Promise<Player[]> [ResolveField], getMemberByUserId(userId: number, organizationId: number): Promise<Member> [Query]
- **MemberFixService** (service; core/src/organization/member/member.service.ts)
  - decorators: Injectable
  - dependencies: dataSource: DataSource, memberRepository: Repository<Member>, memberPlatformAccountRepository: Repository<MemberPlatformAccount>, userAuthRepository: Repository<UserAuthenticationAccount>, playerRepository: Repository<MLE_Player>, playerAccountRepository: Repository<MLE_PlayerAccount>
  - public methods: updateMemberAndPlayerIds(sprocketUserId: number, platformId: string)
- **MemberService** (service; core/src/organization/member/member.service.ts)
  - decorators: Injectable
  - dependencies: memberRepository: Repository<Member>, memberProfileRepository: Repository<MemberProfile>, organizationService: OrganizationService, userService: UserService, eventsService: EventsService, playerService: PlayerService, pubsub: PubSub
  - public methods: restrictedMembersSubTopic(): string, createMember(memberProfile: Omit<MemberProfile, IrrelevantFields | "id" | "member">, organizationId: number, userId: number): Promise<Member>, getMember(query: FindOneOptions<Member>): Promise<Member>, getMemberById(id: number, options?: FindOneOptions<Member>): Promise<Member>, getMembers(query: FindManyOptions<MemberProfile>): Promise<Member[]>, updateMemberProfile(memberId: number, data: Omit<Partial<MemberProfile>, "member">): Promise<MemberProfile>, deleteMember(id: number): Promise<Member>, getFranchiseByMember(memberId: number, organizationId: number, gameId: number): Promise<Franchise | undefined>, enableSubscription(): Promise<void>, getMemberByUserIdAndOrganization(userId: number, organizationId: number): Promise<Member>
- **OrganizationController** (controller; core/src/organization/organization/organization.controller.ts)
  - decorators: Controller
  - dependencies: organizationService: OrganizationService, organizationConfigurationService: OrganizationConfigurationService
  - public methods: getOrganizationProfile(payload: unknown): Promise<OrganizationProfile> [MessagePattern], getOrganizationDiscordGuildsByGuild(payload: unknown): Promise<GetOrganizationDiscordGuildsByGuildResponse> [MessagePattern], getOrganizationByDiscordGuild(payload: unknown): Promise<GetOrganizationByDiscordGuildResponse> [MessagePattern], getGuildsByOrganizationId(payload: unknown): Promise<GetGuildsByOrganizationIdResponse> [MessagePattern], getTransactionsWebhook(payload: unknown): Promise<GetTransactionsDiscordWebhookResponse> [MessagePattern]
- **OrganizationResolver** (resolver; core/src/organization/organization/organization.resolver.ts)
  - decorators: Resolver
  - dependencies: organizationService: OrganizationService
  - public methods: getOrganizationById(id: number): Promise<Organization> [Query], updateOrganizationProfile(id: number, profile: OrganizationProfileInput): Promise<OrganizationProfile> [Mutation, UseGuards], profile(organization: Partial<Organization>): Promise<OrganizationProfile> [ResolveField]
- **OrganizationService** (service; core/src/organization/organization/organization.service.ts)
  - decorators: Injectable
  - dependencies: organizationRepository: Repository<Organization>, organizationProfileRepository: Repository<OrganizationProfile>
  - public methods: createOrganization(organizationProfile: Omit<OrganizationProfile, IrrelevantFields | "id" | "organization">): Promise<Organization>, getOrganizationById(id: number): Promise<Organization>, getOrganization(query: FindOneOptions<OrganizationProfile>): Promise<Organization>, getOrganizations(query?: FindManyOptions<OrganizationProfile>): Promise<Organization[]>, updateOrganizationProfile(organizationId: number, data: Omit<Partial<OrganizationProfile>, "organization">): Promise<OrganizationProfile>, deleteOrganization(id: number): Promise<Organization>, getOrganizationProfileForOrganization(organizationId: number): Promise<OrganizationProfile>
- **PronounsService** (service; core/src/organization/pronouns/pronouns.service.ts)
  - decorators: Injectable
  - dependencies: pronounsRepository: Repository<Pronouns>, organizationService: OrganizationService
  - public methods: createPronouns(organizationId: number, pronouns: Omit<Pronouns, IrrelevantFields | "organization" | "id">): Promise<Pronouns>, getPronounsById(organizationId: number, pronounsId: number): Promise<Pronouns>, getPronouns(query: FindOptionsWhere<Pronouns>, organizationId: number): Promise<Pronouns[]>, deletePronouns(id: number): Promise<Pronouns>

#### Context: replay-parse

- **BallchasingConverterService** (service; core/src/replay-parse/finalization/ballchasing-converter/ballchasing-converter.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: createRound(b: BallchasingResponse): unknown, createTeamStats(b: BallchasingTeam): unknown, createPlayerStats(b: BallchasingPlayer): unknown
- **FinalizationSubscriber** (service; core/src/replay-parse/finalization/finalization.subscriber.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, rocketLeagueFinalizationService: RocketLeagueFinalizationService, submissionService: SubmissionService, redisService: RedisService, scrimService: ScrimService, matchService: MatchService, eloConnectorService: EloConnectorService, replayParseService: ReplayParseService
  - public methods: onApplicationBootstrap(): void
- **RocketLeagueFinalizationService** (service; core/src/replay-parse/finalization/rocket-league/rocket-league-finalization.service.ts)
  - decorators: Injectable
  - dependencies: playerService: PlayerService, matchService: MatchService, sprocketRatingService: SprocketRatingService, mledbPlayerService: MledbPlayerService, teamService: TeamService, ballchasingConverter: BallchasingConverterService, carballConverter: CarballConverterService, mledbFinalizationService: MledbFinalizationService, eligibilityService: EligibilityService, gameSkillGroupService: GameSkillGroupService, dataSource: DataSource
  - public methods: finalizeLFS(submission: LFSReplaySubmission, scrim: Scrim): Promise<SaveScrimFinalizationReturn>, finalizeScrim(submission: ScrimReplaySubmission, scrim: Scrim): Promise<SaveScrimFinalizationReturn>, finalizeMatch(submission: MatchReplaySubmission): Promise<SaveMatchFinalizationReturn>, saveMatchDependents(submission: ReplaySubmission, match: Match, eligibility: boolean, em: EntityManager): Promise<Player[]>, _createRound(match: Match, homeWon: boolean, replay: BallchasingResponse, parser: {type: Parser; version: number;}, outputPath: string): Round, _getBallchasingPlayers(ballchasing: BallchasingResponse): Promise<{ blue: Array<{player: Player; rawPlayer: BallchasingPlayer;}>; orange: Array<{player: Player; rawPlayer: BallchasingPlayer;}>; }>, _createTeamStatLine(rawTeam: BallchasingTeam, round: Round, teamName: string, em: EntityManager, team?: Team): Promise<TeamStatLine>, _createEligibility(points: number, player: Player, matchParent: MatchParent, em: EntityManager): EligibilityData, _createPlayerStatLine(rawPlayer: BallchasingPlayer, player: Player, opposingTeam: BallchasingTeam, teamStats: TeamStatLine, gameMode: GameMode, isHome: boolean, round: Round, em: EntityManager): Promise<PlayerStatLine>, _getSprocketRating(rawPlayer: BallchasingPlayer, opposingTeam: BallchasingTeam, gameMode: GameMode): SprocketRating
- **ReplayParseModResolver** (resolver; core/src/replay-parse/replay-parse.mod.resolver.ts)
  - decorators: Resolver, UseGuards
  - dependencies: rpService: ReplayParseService, submissionService: SubmissionService, finalizationSub: FinalizationSubscriber, redisService: RedisService, scrimService: ScrimService, pubsub: PubSub
  - public methods: getSubmission(submissionId: string): Promise<ReplaySubmission | null> [Query], parseReplays(user: UserPayload, files: Array<Promise<FileUpload>>, submissionId: string): Promise<string[]> [Mutation], mockCompletion(submissionId: string, results: unknown[]): Promise<boolean> [Mutation, UseGuards], resetSubmission(user: UserPayload, submissionId: string): Promise<boolean> [Mutation, UseGuards], forceSubmissionSave(submissionId: string): Promise<boolean> [Mutation, UseGuards], ratifySubmission(user: UserPayload, submissionId: string): Promise<void> [Mutation], rejectSubmission(user: UserPayload, submissionId: string, reason: string): Promise<void> [Mutation], validateSubmission(user: UserPayload, submissionId: string): Promise<ValidationResult> [Mutation], followSubmission(submissionId: string): Promise<AsyncIterator<GqlReplaySubmission>> [Subscription]
- **ReplaySubmissionResolver** (resolver; core/src/replay-parse/replay-parse.resolver.ts)
  - decorators: Resolver
  - dependencies: none
  - public methods: ratifiers(submission: ReplaySubmission): GqlRatifierInfo[] [ResolveField], ratifications(submission: ReplaySubmission): number [ResolveField], userHasRatified(cu: UserPayload, submission: ReplaySubmission): boolean [ResolveField]
- **SubmissionRejectionResolver** (resolver; core/src/replay-parse/replay-parse.resolver.ts)
  - decorators: Resolver
  - dependencies: userService: UserService
  - public methods: playerName(rejection: SubmissionRejection): Promise<string> [ResolveField], reason(rejection: SubmissionRejection): Promise<string> [ResolveField]
- **ReplayParseService** (service; core/src/replay-parse/replay-parse.service.ts)
  - decorators: Injectable
  - dependencies: minioService: MinioService, submissionService: SubmissionService, redisService: RedisService, eventsService: EventsService, memberService: MemberService, mledbPlayerService: MledbPlayerService, pubsub: PubSub
  - public methods: getSubmission(submissionId: string): Promise<ReplaySubmission>, resetBrokenReplays(submissionId: string, playerId: number, override: any): Promise<boolean>, parseReplays(streams: Array<{stream: Readable; filename: string;}>, submissionId: string, userId: number, organizationId: number): Promise<string[]>, mockCompletion(submissionId: string, results: unknown[]): Promise<boolean>, ratifySubmission(submissionId: string, userId: number, organizationId: number): Promise<void>, rejectSubmissionByPlayer(submissionId: string, playerId: number, reason: string): Promise<void>, rejectSubmissionBySystem(submissionId: string, reason: string): Promise<void>, enableSubscription(): Promise<void>

#### Context: scheduling

- **EligibilityService** (service; core/src/scheduling/eligibility/eligibility.service.ts)
  - decorators: Injectable
  - dependencies: eligibilityDataRepository: Repository<EligibilityData>
  - public methods: getEligibilityPointsForPlayer(playerId: number): Promise<number>, getEligibilityEndDate(playerId: number): Promise<Date | null>
- **MatchParentResolver** (resolver; core/src/scheduling/match-parent/match-parent.resolver.ts)
  - decorators: Resolver
  - dependencies: populate: PopulateService
  - public methods: fixture(root: MatchParent): Promise<ScheduleFixture | undefined> [ResolveField]
- **MatchController** (controller; core/src/scheduling/match/match.controller.ts)
  - decorators: Controller
  - dependencies: matchService: MatchService, fixtureService: ScheduleFixtureService
  - public methods: getMatchBySubmissionId(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMatchBySubmissionId>> [MessagePattern], getMatchById(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMatchById>> [MessagePattern], getMatchReportCardWebhooks(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMatchReportCardWebhooks>> [MessagePattern], getMatchInformationAndStakeholders(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetMatchInformationAndStakeholders>> [MessagePattern]
- **MatchPlayerGuard** (service; core/src/scheduling/match/match.guard.ts)
  - decorators: Injectable
  - dependencies: playerService: PlayerService, populateService: PopulateService
  - public methods: getGameAndOrganization(ctx: GraphQLExecutionContext, userPayload: UserPayload): Promise<GameAndOrganization>
- **MatchResolver** (resolver; core/src/scheduling/match/match.resolver.ts)
  - decorators: Resolver
  - dependencies: populate: PopulateService, matchService: MatchService, mledbMatchService: MledbMatchService, eventsService: EventsService, submissionService: SubmissionService, matchRepo: Repository<Match>, roundRepo: Repository<Round>, teamRepo: Repository<Team>, fixtureRepo: Repository<ScheduleFixture>, mleTeamRepo: Repository<MLE_Team>, mleSeriesRepo: Repository<MLE_Series>, seriesReplayRepo: Repository<MLE_SeriesReplay>, seriesToMatchParentRepo: Repository<SeriesToMatchParent>, dataSource: DataSource
  - public methods: getMatchBySubmissionId(submissionId: string): Promise<Match> [Query], postReportCard(matchId: number): Promise<string> [Mutation, UseGuards], reprocessMatches(startDate: Date): Promise<string> [Mutation, UseGuards], markSeriesNCP(matchId: number, isNcp: boolean, winningTeamId?: number, numReplays?: number): Promise<string> [Mutation, UseGuards], markRoundsNCP(roundIds: number[], isNcp: boolean, winningTeamId: number): Promise<string> [Mutation, UseGuards], addDummyReplay(matchId: number, winningTeamId: number): Promise<number> [Mutation, UseGuards], skillGroup(root: Match): Promise<GameSkillGroup> [ResolveField], submissionStatus(root: Match): Promise<MatchSubmissionStatus> [ResolveField], canSubmit(player: Player, root: Match): Promise<boolean> [ResolveField, UseGuards], canRatify(player: Player, root: Match): Promise<boolean> [ResolveField, UseGuards], gameMode(root: Match): Promise<GameMode | undefined> [ResolveField], rounds(root: Match): Promise<Round[]> [ResolveField], matchParent(root: Match): Promise<MatchParent> [ResolveField]
- **MatchService** (service; core/src/scheduling/match/match.service.ts)
  - decorators: Injectable
  - dependencies: matchRepository: Repository<Match>, matchParentRepository: Repository<MatchParent>, invalidationRepository: Repository<Invalidation>, roundRepository: Repository<Round>, teamRepository: Repository<Team>, modeRepo: Repository<GameMode>, dataSource: DataSource, popService: PopulateService, eloConnectorService: EloConnectorService
  - public methods: createMatch(isDummy?: boolean, invalidationId?: number): Promise<Match>, createMatchWithMatchParent(skill_group: GameSkillGroup, mode: string, isDummy?: boolean, invalidationId?: number): Promise<[Match, MatchParent]>, getMatchBySubmissionId(submissionId: string): Promise<Match>, getMatchById(matchId: number, relations?: FindOptionsRelations<Match>): Promise<Match>, getMatch(query: FindOneOptions<Match>): Promise<Match>, getMatchParentEntity(matchId: number): Promise<MatchParentResponse>, resubmitAllMatchesAfter(startDate: Date): Promise<void>, getMatchReportCardWebhooks(matchId: number): Promise<CoreOutput<CoreEndpoint.GetMatchReportCardWebhooks>>, getFranchisesForMatch(matchId: number): Promise<{home: Franchise; away: Franchise;}>, getMatchInfoAndStakeholders(matchId: number): Promise<CoreOutput<CoreEndpoint.GetMatchInformationAndStakeholders>>, markReplaysNcp(replayIds: number[], isNcp: boolean, winningTeamInput?: Team, invalidation?: Invalidation): Promise<string>, translatePayload(matchId: number, isScrim: boolean): Promise<CalculateEloForMatchInput>, translatePlayerStats(playerId: number, bcPlayer: BallchasingPlayer, team: TeamColor): PlayerSummary, calculateMVPR(p: BallchasingPlayer): number, markSeriesNcp(seriesId: number, isNcp: boolean, winningTeamId?: number, numReplays?: number): Promise<string>
- **RoundService** (service; core/src/scheduling/round/round.service.ts)
  - decorators: Injectable
  - dependencies: roundRepo: Repository<Round>, matchRepo: Repository<Match>, invalidationRepo: Repository<Invalidation>
  - public methods: createRound(matchId: number, stats: unknown, isDummy?: boolean, invalidationId?: number): Promise<Round>
- **ScheduleFixtureResolver** (resolver; core/src/scheduling/schedule-fixture/schedule-fixture.resolver.ts)
  - decorators: Resolver
  - dependencies: populate: PopulateService, scheduleFixtureRepo: Repository<ScheduleFixture>, matchRepo: Repository<Match>
  - public methods: getFixture(id: number): Promise<ScheduleFixture> [Query], scheduleGroup(root: ScheduleFixture): Promise<ScheduleGroup> [ResolveField], homeFranchise(root: ScheduleFixture): Promise<Franchise> [ResolveField], awayFranchise(root: ScheduleFixture): Promise<Franchise> [ResolveField], matches(root: ScheduleFixture): Promise<Match[]> [ResolveField]
- **ScheduleFixtureService** (service; core/src/scheduling/schedule-fixture/schedule-fixture.service.ts)
  - decorators: Injectable
  - dependencies: scheduleFixtureRepo: Repository<ScheduleFixture>, m_fixtureRepo: Repository<MLE_Fixture>, m_seriesRepo: Repository<MLE_Series>, f2fRepo: Repository<FixtureToFixture>, s2mpRepo: Repository<SeriesToMatchParent>, franchiseService: FranchiseService, matchService: MatchService
  - public methods: getFixturesForGroup(groupId: number): Promise<ScheduleFixture[]>, getFixtureForMatchParent(matchParentId: number): Promise<ScheduleFixture>, createScheduleFixture(schedule_group: ScheduleGroup, m_match: MLE_Match, home_name: string, away_name: string, skill_groups: GameSkillGroup[]): Promise<[ScheduleFixture, MLE_Fixture]>
- **ScheduleGroupTypeService** (service; core/src/scheduling/schedule-group/schedule-group-type.service.ts)
  - decorators: Injectable
  - dependencies: scheduleGroupTypeRepo: Repository<ScheduleGroupType>
  - public methods: getScheduleGroupTypesForOrg(orgId: number): Promise<ScheduleGroupType[]>
- **ScheduleGroupModResolver** (resolver; core/src/scheduling/schedule-group/schedule-group.mod.resolver.ts)
  - decorators: Resolver, UseGuards
  - dependencies: scheduleGroupService: ScheduleGroupService, scheduleGroupTypeService: ScheduleGroupTypeService
  - public methods: getScheduleGroupTypes(user: UserPayload): Promise<ScheduleGroupType[]> [Query], getScheduleGroups(user: UserPayload, type: string, gameId?: number): Promise<ScheduleGroup[]> [Query], createSeason(num: number, file: Promise<FileUpload>): Promise<ScheduleGroup[]> [Mutation, UseGuards]
- **ScheduleGroupResolver** (resolver; core/src/scheduling/schedule-group/schedule-group.resolver.ts)
  - decorators: Resolver
  - dependencies: populate: PopulateService
  - public methods: type(root: ScheduleGroup): Promise<ScheduleGroupType> [ResolveField], game(root: ScheduleGroup): Promise<Game> [ResolveField], parentGroup(root: ScheduleGroup): Promise<ScheduleGroup | undefined> [ResolveField], childGroups(root: ScheduleGroup): Promise<ScheduleGroup[]> [ResolveField], fixtures(root: ScheduleGroup): Promise<ScheduleFixture[]> [ResolveField]
- **ScheduleGroupService** (service; core/src/scheduling/schedule-group/schedule-group.service.ts)
  - decorators: Injectable
  - dependencies: scheduleGroupRepo: Repository<ScheduleGroup>, m_seasonRepo: Repository<MLE_Season>, m_matchRepo: Repository<MLE_Match>, s2sgRepo: Repository<SeasonToScheduleGroup>, m2sgRepo: Repository<MatchToScheduleGroup>, scheduleFixtureService: ScheduleFixtureService, gameSkillGroupRepository: Repository<GameSkillGroup>, dataSource: DataSource
  - public methods: getScheduleGroups(orgId: number, type: string, gameId?: number, current: boolean): Promise<ScheduleGroup[]>, createSeasonSchedule(season_number: number, parsedFixtures: RawFixture): Promise<ScheduleGroup[]>

#### Context: scrim

- **ScrimMetricsResolver** (resolver; core/src/scrim/metrics/scrim-metrics.resolver.ts)
  - decorators: Resolver
  - dependencies: scrimService: ScrimService, scrimCrudService: ScrimMetaCrudService, pubSub: PubSub
  - public methods: getScrimMetrics(): Promise<ScrimMetrics> [Query], followScrimMetrics(): Promise<AsyncIterator<ScrimMetrics>> [Subscription], completedScrims(period: Period): Promise<number> [ResolveField], previousCompletedScrims(period: Period): Promise<number> [ResolveField]
- **ScrimMetaCrudService** (service; core/src/scrim/scrim-crud/scrim-crud.service.ts)
  - decorators: Injectable
  - dependencies: scrimRepo: Repository<ScrimMeta>
  - public methods: getScrimCountInPreviousPeriod(p: Period, previousPeriod: boolean): Promise<number>
- **ScrimToggleResolver** (resolver; core/src/scrim/scrim-toggle/scrim-toggle.resolver.ts)
  - decorators: Resolver
  - dependencies: scrimToggleService: ScrimToggleService, pubSub: PubSub
  - public methods: getScrimsDisabled(): Promise<boolean> [Query], setScrimsDisabled(disabled: boolean): Promise<boolean> [Mutation, UseGuards], followScrimsDisabled(): Promise<AsyncIterator<boolean>> [Subscription]
- **ScrimToggleService** (service; core/src/scrim/scrim-toggle/scrim-toggle.service.ts)
  - decorators: Injectable
  - dependencies: redisService: RedisService, eventsService: EventsService, pubSub: PubSub
  - public methods: scrimsDisabledSubTopic(): string, scrimsAreDisabled(): Promise<boolean>, disableScrims(): Promise<boolean>, enableScrims(): Promise<boolean>, enableSubscription(): Promise<void>
- **ScrimConsumer** (consumer; core/src/scrim/scrim.consumer.ts)
  - decorators: Processor
  - dependencies: scrimService: ScrimService, memberRestrictionService: MemberRestrictionService, memberService: MemberService, organizationConfigurationService: OrganizationConfigurationService
  - public methods: timeoutQueue(job: Job<string>): Promise<void> [Process]
- **ScrimController** (controller; core/src/scrim/scrim.controller.ts)
  - decorators: Controller
  - dependencies: scrimService: ScrimService
  - public methods: getScrimReportCardWebhooks(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>> [MessagePattern], getUsersLatestScrim(payload: unknown): Promise<CoreOutput<CoreEndpoint.GetUsersLatestScrim>> [MessagePattern]
- **CreateScrimPlayerGuard** (service; core/src/scrim/scrim.guard.ts)
  - decorators: Injectable
  - dependencies: gameModeService: GameModeService, playerService: PlayerService
  - public methods: getGameAndOrganization(ctx: GraphQLExecutionContext, userPayload: UserPayload): Promise<GameAndOrganization>
- **JoinScrimPlayerGuard** (service; core/src/scrim/scrim.guard.ts)
  - decorators: Injectable
  - dependencies: scrimService: ScrimService, gameModeService: GameModeService, playerService: PlayerService
  - public methods: getGameAndOrganization(ctx: GraphQLExecutionContext): Promise<GameAndOrganization>
- **ScrimResolverPlayerGuard** (service; core/src/scrim/scrim.guard.ts)
  - decorators: Injectable
  - dependencies: gameModeService: GameModeService, playerService: PlayerService
  - public methods: getGameAndOrganization(ctx: GraphQLExecutionContext, userPayload: UserPayload): Promise<GameAndOrganization>
- **ScrimManagementResolver** (resolver; core/src/scrim/scrim.management/scrim.management.resolver.ts)
  - decorators: Resolver
  - dependencies: scrimService: ScrimService, pubSub: PubSub
  - public methods: getActiveScrims(skillGroupId: number): Promise<IScrim[]> [Query], cancelScrim(scrimId: string): Promise<IScrim> [Mutation, UseGuards], followActiveScrims(): Promise<AsyncIterator<ScrimEvent>> [Subscription]
- **ScrimModuleResolver** (resolver; core/src/scrim/scrim.mod.resolver.ts)
  - decorators: Resolver, UseGuards
  - dependencies: pubSub: PubSub, playerService: PlayerService, scrimService: ScrimService, gameModeService: GameModeService, skillGroupService: GameSkillGroupService, organizationConfigurationService: OrganizationConfigurationService, scrimToggleService: ScrimToggleService, mlePlayerService: MledbPlayerService
  - public methods: getAllScrims(user: UserPayload, status?: ScrimStatus): Promise<Scrim[]> [Query, UseGuards], getAvailableScrims(user: UserPayload, status: ScrimStatus): Promise<Scrim[]> [Query, UseGuards], getLFSScrims(user: UserPayload): Promise<Scrim[]> [Query, UseGuards], getCurrentScrim(user: UserPayload): Promise<Scrim | null> [Query], createScrim(user: UserPayload, data: CreateScrimInput): Promise<Scrim> [Mutation, UseGuards], createLFSScrim(user: UserPayload, data: CreateLFSScrimInput): Promise<Scrim> [Mutation, UseGuards], joinScrim(user: UserPayload, player: Player, scrimId: string, leaveAfter: number, groupKey?: string, createGroup?: boolean): Promise<boolean> [Mutation, UseGuards], leaveScrim(user: UserPayload): Promise<boolean> [Mutation], checkInToScrim(user: UserPayload): Promise<boolean> [Mutation], cancelScrim(scrimId: string): Promise<Scrim> [Mutation], lockScrim(scrimId: string): Promise<boolean> [Mutation, UseGuards], unlockScrim(scrimId: string): Promise<boolean> [Mutation, UseGuards], followCurrentScrim(user: UserPayload): Promise<AsyncIterator<ScrimEvent> | undefined> [Subscription], followPendingScrims(): Promise<AsyncIterator<Scrim>> [Subscription], followLFSScrims(): Promise<AsyncIterator<Scrim>> [Subscription]
- **ScrimModuleResolverPublic** (resolver; core/src/scrim/scrim.mod.resolver.ts)
  - decorators: Resolver
  - dependencies: pubSub: PubSub, scrimService: ScrimService
  - public methods: getScrimMetrics(): Promise<ScrimMetrics> [Query], followScrimMetrics(): Promise<AsyncIterator<ScrimMetrics>> [Subscription]
- **ScrimResolver** (resolver; core/src/scrim/scrim.resolver.ts)
  - decorators: Resolver
  - dependencies: gameSkillGroupService: GameSkillGroupService, gameModeService: GameModeService
  - public methods: gameMode(scrim: Partial<Scrim>): Promise<GameMode> [ResolveField], skillGroup(scrim: Partial<Scrim>): Promise<GameSkillGroup> [ResolveField], players(scrim: Scrim): undefined | ScrimPlayer[] [ResolveField], playersAdmin(scrim: Scrim): undefined | ScrimPlayer[] [ResolveField, UseGuards], lobby(scrim: Scrim): ScrimLobby | undefined [ResolveField, UseGuards], currentGroup(scrim: Scrim, user: UserPayload): ScrimGroup | undefined [ResolveField], playerCount(scrim: Scrim): number [ResolveField], maxPlayers(scrim: Scrim): number [ResolveField]
- **ScrimService** (service; core/src/scrim/scrim.service.ts)
  - decorators: Injectable
  - dependencies: matchmakingService: MatchmakingService, eventsService: EventsService, gameSkillGroupService: GameSkillGroupService, memberService: MemberService, franchiseService: FranchiseService, mleScrimService: MledbFinalizationService, pubsub: PubSub, playerStatLineRepository: Repository<PlayerStatLine>
  - public methods: metricsSubTopic(): string, pendingScrimsSubTopic(): string, allActiveScrimsSubTopic(): string, lfsScrimsSubTopic(): string, getAllScrims(skillGroupId?: number): Promise<IScrim[]>, getScrimMetrics(): Promise<IScrimMetrics>, getScrimByPlayer(playerId: number): Promise<IScrim | null>, getScrimBySubmissionId(submissionId: string): Promise<IScrim | null>, getScrimById(scrimId: string): Promise<IScrim | null>, createScrim(data: CreateScrimOptions): Promise<IScrim>, createLFSScrim(data: CreateLFSScrimRequest): Promise<IScrim>, joinScrim(data: JoinScrimOptions): Promise<boolean>, leaveScrim(playerId: number, scrimId: string): Promise<boolean>, checkIn(playerId: number, scrimId: string): Promise<boolean>, cancelScrim(scrimId: string): Promise<IScrim>, setScrimLocked(scrimId: string, locked: boolean): Promise<boolean>, getLatestScrimIdByUserId(userId: number, organizationId: number): Promise<number>, getRelevantWebhooks(scrim: CoreInput<CoreEndpoint.GetScrimReportCardWebhooks>): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>>, enableSubscription(): Promise<void>

#### Context: sprocket-rating

- **SprocketRatingService** (service; core/src/sprocket-rating/sprocket-rating.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: calcSprocketRating(core: SprocketRatingInput): SprocketRating, calcSprocketRating2s(core: SprocketRatingInput): SprocketRating, calcSprocketRating3s(core: SprocketRatingInput): SprocketRating

#### Context: submission

- **SubmissionManagementResolver** (resolver; core/src/submission/submission-management/submission-management.resolver.ts)
  - decorators: Resolver
  - dependencies: submissionService: SubmissionService
  - public methods: getActiveSubmissions(): Promise<ReplaySubmission[]> [Query, UseGuards], adminResetSubmission(submissionId: string): Promise<boolean> [Mutation, UseGuards]
- **SubmissionService** (service; core/src/submission/submission.service.ts)
  - decorators: Injectable
  - dependencies: commonService: CommonSubmissionService
  - public methods: getAllSubmissions(): Promise<ReplaySubmission[]>, adminResetSubmission(submissionId: string): Promise<boolean>

#### Context: util

- **PopulateService** (service; core/src/util/populate/populate.service.ts)
  - decorators: Injectable
  - dependencies: repo: Connection
  - public methods: populateOneOrFail(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath]>, populateOne(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath] | undefined>, populateMany(base: Class<Entity>, root: Entity, relation: RelationPath): Promise<Entity[RelationPath]>

### Data Contracts and Interfaces

#### Context: configuration

- classes:
  - OrganizationConfiguration (core/src/configuration/organization-configuration/organization-configuration.types.ts)
    - public properties: organization: Organization, key: string, allowedValues: OrganizationConfigurationAllowedValue[], value: string
    - public methods: none

#### Context: database

- classes:
  - Action (core/src/database/authorization/action/action.model.ts)
    - public properties: description: string, code: string
    - public methods: none
  - FranchiseLeadershipRole (core/src/database/authorization/franchise_leadership_role/franchise_leadership_role.model.ts)
    - public properties: name: string, ordinal: number, bearer: PermissionBearer
    - public methods: none
  - FranchiseLeadershipSeat (core/src/database/authorization/franchise_leadership_seat/franchise_leadership_seat.model.ts)
    - public properties: role: FranchiseLeadershipRole, appointments: FranchiseLeadershipAppointment[]
    - public methods: none
  - FranchiseStaffRole (core/src/database/authorization/franchise_staff_role/franchise_staff_role.model.ts)
    - public properties: name: string, ordinal: number, bearer: PermissionBearer, game: Game
    - public methods: none
  - FranchiseStaffSeat (core/src/database/authorization/franchise_staff_seat/franchise_staff_seat.model.ts)
    - public properties: role: FranchiseStaffRole, appointments: FranchiseStaffAppointment[]
    - public methods: none
  - OrganizationStaffPosition (core/src/database/authorization/organization_staff_position/organization_staff_position.model.ts)
    - public properties: role: OrganizationStaffRole, team: OrganizationStaffTeam, bearer: PermissionBearer
    - public methods: none
  - OrganizationStaffRole (core/src/database/authorization/organization_staff_role/organization_staff_role.model.ts)
    - public properties: name: string, ordinal: number, bearer: PermissionBearer
    - public methods: none
  - OrganizationStaffSeat (core/src/database/authorization/organization_staff_seat/organization_staff_seat.model.ts)
    - public properties: member: Member, position: OrganizationStaffPosition
    - public methods: none
  - OrganizationStaffTeam (core/src/database/authorization/organization_staff_team/organization_staff_team.model.ts)
    - public properties: name: string, ordinal: number, bearer: PermissionBearer
    - public methods: none
  - PermissionBearer (core/src/database/authorization/permission_bearer/permission_bearer.model.ts)
    - public properties: none
    - public methods: none
  - Permission (core/src/database/authorization/permissions/permissions.model.ts)
    - public properties: action: Action, bearer: PermissionBearer
    - public methods: none
  - BaseModel (core/src/database/base-model.ts)
    - public properties: id: number, createdAt: Date, updatedAt: Date, deletedAt: Date
    - public methods: none
  - OrganizationConfigurationAllowedValue (core/src/database/configuration/organization_configuration_allowed_value/organization_configuration_allowed_value.model.ts)
    - public properties: value: string, key: OrganizationConfigurationKey, pattern: boolean
    - public methods: none
  - OrganizationConfigurationKey (core/src/database/configuration/organization_configuration_key/organization_configuration_key.model.ts)
    - public properties: code: OrganizationConfigurationKeyCode, default: string, allowedValues: OrganizationConfigurationAllowedValue[], type: OrganizationConfigurationKeyType
    - public methods: none
  - OrganizationConfigurationValue (core/src/database/configuration/organization_configuration_value/organization_configuration_value.model.ts)
    - public properties: value: string, organization: Organization, key: OrganizationConfigurationKey
    - public methods: none
  - SprocketConfiguration (core/src/database/configuration/sprocket_configuration/sprocket_configuration.model.ts)
    - public properties: key: string, value: string
    - public methods: none
  - VerbiageCode (core/src/database/configuration/verbiage_code/verbiage_code.model.ts)
    - public properties: code: string, default: string
    - public methods: none
  - Verbiage (core/src/database/configuration/verbiage/verbiage.model.ts)
    - public properties: term: string, organization: Organization, code: VerbiageCode
    - public methods: none
  - DraftPick (core/src/database/draft/draft_pick/draft_pick.model.ts)
    - public properties: ordinal: number, round: number, originalTeam: Team, executingTeam: Team, skillGroup: GameSkillGroup, scheduleGroup: ScheduleGroup, selection: DraftSelection
    - public methods: none
  - DraftSelection (core/src/database/draft/draft_selection/draft_selection.model.ts)
    - public properties: draftPick: DraftPick, player: Player
    - public methods: none
  - FranchiseGroupAssignment (core/src/database/franchise/franchise_group_assignment/franchise_group_assignment.model.ts)
    - public properties: franchise: Franchise, group: FranchiseGroup, game: Game
    - public methods: none
  - FranchiseGroupProfile (core/src/database/franchise/franchise_group_profile/franchise_group_profile.model.ts)
    - public properties: name: string, group: FranchiseGroup
    - public methods: none
  - FranchiseGroupType (core/src/database/franchise/franchise_group_type/franchise_group_type.model.ts)
    - public properties: code: string, description: string, franchiseGroups: FranchiseGroup[]
    - public methods: none
  - FranchiseGroup (core/src/database/franchise/franchise_group/franchise_group.model.ts)
    - public properties: parentGroup: FranchiseGroup, childGroups: FranchiseGroup[], type: FranchiseGroupType, profile: FranchiseGroupProfile
    - public methods: none
  - FranchiseLeadershipAppointment (core/src/database/franchise/franchise_leadership_appointment/franchise_leadership_appointment.model.ts)
    - public properties: franchise: Franchise, member: Member, seat: FranchiseLeadershipSeat
    - public methods: none
  - FranchiseProfile (core/src/database/franchise/franchise_profile/franchise_profile.model.ts)
    - public properties: title: string, code: string, scrimReportCardWebhook: Webhook, matchReportCardWebhook: Webhook, submissionWebhook: Webhook, submissionDiscordRoleId: string, photo: Photo, franchise: Franchise, primaryColor: string, secondaryColor: string
    - public methods: none
  - FranchiseStaffAppointment (core/src/database/franchise/franchise_staff_appointment/franchise_staff_appointment.model.ts)
    - public properties: franchise: Franchise, member: Member, seat: FranchiseStaffSeat
    - public methods: none
  - Franchise (core/src/database/franchise/franchise/franchise.model.ts)
    - public properties: profile: FranchiseProfile, groupAssignments: FranchiseGroupAssignment[], staffAppointments: FranchiseStaffAppointment[], leadershipAppointments: FranchiseLeadershipAppointment[], organization: Organization
    - public methods: none
  - GameSkillGroupProfile (core/src/database/franchise/game_skill_group_profile/game_skill_group_profile.model.ts)
    - public properties: code: string, description: string, scrimReportCardWebhook: Webhook, matchReportCardWebhook: Webhook, scrimWebhook: Webhook, scrimDiscordRoleId: string, color: string, photo: Photo, discordEmojiId: string, skillGroup: GameSkillGroup, skillGroupId: number
    - public methods: none
  - GameSkillGroup (core/src/database/franchise/game_skill_group/game_skill_group.model.ts)
    - public properties: ordinal: number, salaryCap: number, profile: GameSkillGroupProfile, game: Game, roleUseLimits: RosterRoleUseLimits, players: Player[], teams: Team[], organization: Organization, organizationId: number
    - public methods: none
  - Player (core/src/database/franchise/player/player.model.ts)
    - public properties: member: Member, memberId: number, skillGroup: GameSkillGroup, skillGroupId: number, salary: number, slot: RosterSlot, franchiseName: string, franchisePositions: string[]
    - public methods: none
  - RosterRoleUsage (core/src/database/franchise/roster_role_usages/roster_role_usages.model.ts)
    - public properties: team: Team, player: Player, rosterRole: RosterRole, match: Match
    - public methods: none
  - RosterRoleUseLimits (core/src/database/franchise/roster_role_use_limits/roster_role_use_limits.model.ts)
    - public properties: code: string, perMode: number, total: number, skillGroup: GameSkillGroup, groupType: ScheduleGroupType
    - public methods: none
  - RosterRole (core/src/database/franchise/roster_role/roster_role.model.ts)
    - public properties: code: string, description: string, game: Game, skillGroup: GameSkillGroup, organization: Organization
    - public methods: none
  - RosterSlot (core/src/database/franchise/roster_slot/roster_slot.model.ts)
    - public properties: role: RosterRole, team: Team, player: Player
    - public methods: none
  - Team (core/src/database/franchise/team/team.model.ts)
    - public properties: franchise: Franchise, skillGroup: GameSkillGroup
    - public methods: none
  - EnabledFeature (core/src/database/game/enabled_feature/enabled_feature.model.ts)
    - public properties: feature: GameFeature, organization: Organization
    - public methods: none
  - Feature (core/src/database/game/feature/feature.model.ts)
    - public properties: code: FeatureCode, description: string, dependencies: Feature[], supportedGames: GameFeature[]
    - public methods: none
  - GameFeature (core/src/database/game/game_feature/game_feature.model.ts)
    - public properties: game: Game, feature: Feature, enabledOrgs: EnabledFeature[]
    - public methods: none
  - GameMode (core/src/database/game/game_mode/game_mode.model.ts)
    - public properties: game: Game, gameId: number, code: string, description: string, teamSize: number, teamCount: number
    - public methods: none
  - Game (core/src/database/game/game/game.model.ts)
    - public properties: title: string, modes: GameMode[], skillGroups: GameSkillGroup[], supportedPlatforms: Platform[], supportedFeatures: GameFeature[]
    - public methods: none
  - Platform (core/src/database/game/platform/platform.model.ts)
    - public properties: code: string, memberAccounts: MemberPlatformAccount[], supportedGames: Game[]
    - public methods: none
  - UserRoles (core/src/database/identity/roles/user_roles.model.ts)
    - public properties: accountType: UserRolesType
    - public methods: none
  - UserAuthenticationAccount (core/src/database/identity/user_authentication_account/user_authentication_account.model.ts)
    - public properties: user: User, accountId: string, accountType: UserAuthenticationAccountType, oauthToken: string
    - public methods: none
  - UserProfile (core/src/database/identity/user_profile/user_profile.model.ts)
    - public properties: email: string, displayName: string, firstName: string, lastName: string, description: string, user: User
    - public methods: none
  - User (core/src/database/identity/user/user.model.ts)
    - public properties: authenticationAccounts: UserAuthenticationAccount[], profile: UserProfile, type: UserRolesType[], members: Member[]
    - public methods: none
  - ImageTemplateQueryFilters (core/src/database/image-gen/image_template/image_template_query/image_template_query_filters.ts)
    - public properties: name: string, description: string, code: string, query: string
    - public methods: none
  - ImageTemplateQuery (core/src/database/image-gen/image_template/image_template_query/image_template_query.ts)
    - public properties: query: string, filters: ImageTemplateQueryFilters
    - public methods: none
  - ImageTemplate (core/src/database/image-gen/image_template/image_template.model.ts)
    - public properties: templateStructure: unknown, reportCode: string, displayName: string, description: string, query: ImageTemplateQuery
    - public methods: none
  - DivisionToFranchiseGroup (core/src/database/mledb-bridge/division_to_franchise_group.model.ts)
    - public properties: id: number, divison: string, franchiseGroupId: number
    - public methods: none
  - FixtureToFixture (core/src/database/mledb-bridge/fixture_to_fixture.model.ts)
    - public properties: id: number, mleFixtureId: number, sprocketFixtureId: number
    - public methods: none
  - LeagueToSkillGroup (core/src/database/mledb-bridge/league_to_skill_group.model.ts)
    - public properties: id: number, league: string, skillGroupId: number
    - public methods: none
  - MatchToScheduleGroup (core/src/database/mledb-bridge/match_to_schedule_group.model.ts)
    - public properties: id: number, matchId: number, weekScheduleGroupId: number
    - public methods: none
  - PlayerToPlayer (core/src/database/mledb-bridge/player_to_player.model.ts)
    - public properties: id: number, mledPlayerId: number, sprocketPlayerId: number
    - public methods: none
  - PlayerToUser (core/src/database/mledb-bridge/player_to_user.model.ts)
    - public properties: id: number, playerId: number, userId: number
    - public methods: none
  - SeasonToScheduleGroup (core/src/database/mledb-bridge/season_to_schedule_group.model.ts)
    - public properties: id: number, seasonNumber: number, scheduleGroupId: number
    - public methods: none
  - SeriesToMatchParent (core/src/database/mledb-bridge/series_to_match_parent.model.ts)
    - public properties: id: number, seriesId: number, matchParentId: number
    - public methods: none
  - TeamToFranchise (core/src/database/mledb-bridge/team_to_franchise.model.ts)
    - public properties: id: number, team: string, franchiseId: number
    - public methods: none
  - MLE_ChannelMap (core/src/database/mledb/ChannelMap.model.ts)
    - public properties: channelType: ChannelType, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, channelId: string
    - public methods: none
  - MLE_Config (core/src/database/mledb/Config.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, key: string, value: string
    - public methods: none
  - MLE_Division (core/src/database/mledb/Division.model.ts)
    - public properties: name: string, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, conference: Conference, teams: MLE_Team[]
    - public methods: none
  - MLE_DraftOrder (core/src/database/mledb/DraftOrder.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, seasonSeasonNumber: number, originalTeamName: string, teamName: string, league: string, round: number, pick: number, seasonSeasonNumber2: MLE_Season
    - public methods: none
  - MLE_EligibilityData (core/src/database/mledb/EligibilityData.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, playerId: number, scrimId: number, scrimPoints: number, player: MLE_Player, scrim: MLE_Scrim
    - public methods: none
  - MLE_EloData (core/src/database/mledb/EloData.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, playerId: number, replayId: number | null, elo: number, previousNodeId: number | null, nextNodeId: number | null, chain: number, league: string | null, nextNode: MLE_EloData, previousNode: MLE_EloData, replay: MLE_SeriesReplay, player: MLE_Player
    - public methods: none
  - MLE_Fixture (core/src/database/mledb/Fixture.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, homeName: string, awayName: string, matchId: number, channelId: string, match: MLE_Match, series: MLE_Series[]
    - public methods: none
  - MLE_Footers (core/src/database/mledb/Footers.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, text: string
    - public methods: none
  - MLE_LeagueBranding (core/src/database/mledb/LeagueBranding.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, league: League, color: string, badgeImgLink: string, discordEmojiId: string | null
    - public methods: none
  - MLE_Match (core/src/database/mledb/Match.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, from: Date, to: Date, isDoubleHeader: boolean, matchNumber: number, map: string, fixtures: MLE_Fixture[], season: MLE_Season
    - public methods: none
  - MLE_Player (core/src/database/mledb/Player.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, mleid: number, name: string, salary: number, teamName: string, league: League, role: Role | null, preferredPlatform: string | null, peakMmr: number | null, timezone: Timezone, discordId: string | null, modePreference: ModePreference, suspended: boolean, accounts: MLE_PlayerAccount[], playerOrgs: MLE_PlayerToOrg[]
    - public methods: none
  - MLE_PlayerAccount (core/src/database/mledb/PlayerAccount.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, platform: MLE_Platform, tracker: string | null, platformId: string | null, player: MLE_Player
    - public methods: none
  - MLE_PlayerHistory (core/src/database/mledb/PlayerHistory.model.ts)
    - public properties: historyId: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, mleid: number, name: string, salary: number, teamName: string, league: League, role: Role | null, preferredPlatform: string | null, peakMmr: number | null, timezone: Timezone, discordId: string | null, modePreference: string, timestamp: Date, suspended: boolean
    - public methods: none
  - MLE_PlayerStats (core/src/database/mledb/PlayerStats.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, startTime: number, endTime: number, carName: string, carId: number, steeringSensitivity: number, playerPlatform: string, cameraFov: number, cameraHeight: number, cameraPitch: number, cameraDistance: number, cameraStiffness: number, cameraSwivelSpeed: number, cameraTransitionSpeed: number, coreStatsId: number, boostPerMinute: number, ... +77 more
    - public methods: none
  - MLE_PlayerStatsCore (core/src/database/mledb/PlayerStatsCore.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, color: string, score: number, shots: number, goals: number, saves: number, assists: number, goals_against: number, shots_against: number, mvp: boolean, mvpr: number, opi: number, dpi: number, gpi: number, playerStats: MLE_PlayerStats, player: MLE_Player, ... +1 more
    - public methods: none
  - MLE_PlayerToOrg (core/src/database/mledb/PlayerToOrg.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, orgTeam: number, player: MLE_Player
    - public methods: none
  - MLE_PsyonixApiResult (core/src/database/mledb/PsyonixApiResult.model.ts)
    - public properties: id: number, timestamp: Date, playlist: number, tier: number, division: number, skill: number, matchesPlayed: number, winStreak: number, sigma: number, mu: number, playerAccount: MLE_PlayerAccount
    - public methods: none
  - MLE_SalaryCap (core/src/database/mledb/SalaryCap.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, league: string, maxSalary: number
    - public methods: none
  - MLE_Scrim (core/src/database/mledb/Scrim.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, mode: string, type: string, baseScrimPoints: number, eligibilityData: MLE_EligibilityData[], author: MLE_Player, host: MLE_Player, series: MLE_Series
    - public methods: none
  - MLE_Season (core/src/database/mledb/Season.model.ts)
    - public properties: seasonNumber: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, startDate: Date, endDate: Date, rosterLocked: boolean, weekLength: number, draftOrders: MLE_DraftOrder[], matches: MLE_Match[]
    - public methods: none
  - MLE_Series (core/src/database/mledb/Series.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, league: string, submissionTimestamp: Date | null, scheduledTime: Date | null, fullNcp: boolean, mode: LegacyGameMode, fixtureId: number | null, scrimId: number | null, streamEventMessageId: string | null, fixture: MLE_Fixture, scrim: MLE_Scrim, seriesReplays: MLE_SeriesReplay[], streamEvent: MLE_StreamEvent, teamRoleUsages: MLE_TeamRoleUsage[]
    - public methods: none
  - MLE_SeriesReplay (core/src/database/mledb/SeriesReplay.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, map: RocketLeagueMap | null, matchGuid: string | null, ballchasingId: string | null, duration: number, ncp: boolean, overtime: boolean, overtimeSeconds: number, winningTeamName: string | null, winningColor: string | null, played: Date | null, isDummy: boolean, eloData: MLE_EloData[], playerStats: MLE_PlayerStats[], playerStatsCores: MLE_PlayerStatsCore[], series: MLE_Series, ... +1 more
    - public methods: none
  - MLE_StreamEvent (core/src/database/mledb/StreamEvent.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, channel: string, seriesId: number | null, eventTime: Date, description: string, format: EventFormat, discordId: string | null, series: MLE_Series
    - public methods: none
  - MLE_Team (core/src/database/mledb/Team.model.ts)
    - public properties: name: string, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, franchiseManagerId: number | null, generalManagerId: number | null, doublesAssistantGeneralManagerId: number | null, standardAssistantGeneralManagerId: number | null, prSupportId: number | null, callsign: string, brandingId: number | null, branding: MLE_TeamBranding, divisionName: MLE_Division, doublesAssistantGeneralManager: MLE_Player, franchiseManager: MLE_Player, generalManager: MLE_Player, prSupport: MLE_Player, standardAssistantGeneralManager: MLE_Player
    - public methods: none
  - MLE_TeamBranding (core/src/database/mledb/TeamBranding.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, teamName: string, primaryColor: string, secondaryColor: string, logoImgLink: string, discordEmojiId: string | null, team: MLE_Team
    - public methods: none
  - MLE_TeamCoreStats (core/src/database/mledb/TeamCoreStats.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, teamName: string | null, color: string | null, goals: number | null, goalsAgainst: number | null, possessionTime: number | null, timeInSide: number | null, replay: MLE_SeriesReplay
    - public methods: none
  - MLE_TeamRoleUsage (core/src/database/mledb/TeamRoleUsage.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, teamName: string, league: string, role: Role, series: MLE_Series
    - public methods: none
  - MLE_TeamToCaptain (core/src/database/mledb/TeamToCaptain.model.ts)
    - public properties: id: number, createdBy: string, createdAt: Date, updatedBy: string, updatedAt: Date, playerId: number, teamName: string, league: string, player: MLE_Player
    - public methods: none
  - Approval (core/src/database/organization/approval/approval.model.ts)
    - public properties: notes: string, isApproved: boolean, approvedBy: Member
    - public methods: none
  - MemberPlatformAccount (core/src/database/organization/member_platform_account/member_platform_account.model.ts)
    - public properties: member: Member, platform: Platform, platformAccountId: string
    - public methods: none
  - MemberProfile (core/src/database/organization/member_profile/member_profile.model.ts)
    - public properties: name: string, pronouns: Pronouns, profilePicture: Photo, member: Member
    - public methods: none
  - MemberRestriction (core/src/database/organization/member_restriction/member_restriction.model.ts)
    - public properties: type: MemberRestrictionType, expiration: Date, reason: string, manualExpiration: Date, manualExpirationReason: string, forgiven: boolean, member: Member, memberId: number
    - public methods: none
  - Member (core/src/database/organization/member/member.model.ts)
    - public properties: platformAccounts: MemberPlatformAccount[], profile: MemberProfile, organization: Organization, players: Player[], user: User, restrictions: MemberRestriction, userId: number, organizationId: number
    - public methods: none
  - OrganizationMottos (core/src/database/organization/organization_mottos/organization_mottos.model.ts)
    - public properties: organization: Organization, motto: string
    - public methods: none
  - OrganizationProfile (core/src/database/organization/organization_profile/organization_profile.model.ts)
    - public properties: name: string, description: string, websiteUrl: string, primaryColor: string, secondaryColor: string, logoUrl: string, organization: Organization
    - public methods: none
  - Organization (core/src/database/organization/organization/organization.model.ts)
    - public properties: profile: OrganizationProfile, mottos: OrganizationMottos[], pronouns: Pronouns[], enabledFeatures: EnabledFeature[], verbiages: Verbiage[], configurationValues: OrganizationConfigurationValue[], scheduleGroupTypes: ScheduleGroupType[], members: Member[]
    - public methods: none
  - Photo (core/src/database/organization/photo/photo.model.ts)
    - public properties: url: string, approval: Approval
    - public methods: none
  - Pronouns (core/src/database/organization/pronouns/pronouns.model.ts)
    - public properties: organization: Organization, subjectPronoun: string, objectPronoun: string, possessiveAdjective: string, possessivePronoun: string, reflexivePronoun: string
    - public methods: none
  - EligibilityData (core/src/database/scheduling/eligibility_data/eligibility_data.model.ts)
    - public properties: matchParent: MatchParent, points: number, player: Player
    - public methods: none
  - Invalidation (core/src/database/scheduling/invalidation/invalidation.model.ts)
    - public properties: description: string, favorsHomeTeam: boolean
    - public methods: none
  - MatchParent (core/src/database/scheduling/match_parent/match_parent.model.ts)
    - public properties: event: ScheduledEvent, scrimMeta: ScrimMeta, fixture: ScheduleFixture, match: Match
    - public methods: none
  - Match (core/src/database/scheduling/match/match.model.ts)
    - public properties: isDummy: boolean, invalidation: Invalidation, skillGroup: GameSkillGroup, skillGroupId: number, rounds: Round[], matchParent: MatchParent, submissionId: string, submissionStatus: MatchSubmissionStatus, canSubmit: boolean, canRatify: boolean, gameMode: GameMode
    - public methods: none
  - PlayerStatLine (core/src/database/scheduling/player_stat_line/player_stat_line.model.ts)
    - public properties: stats: unknown, round: Round, isHome: boolean, teamStats: TeamStatLine, player: Player
    - public methods: none
  - Round (core/src/database/scheduling/round/round.model.ts)
    - public properties: homeWon: boolean, roundStats: unknown, parser: Parser, parserVersion: number, outputPath: string, isDummy: boolean, match: Match, invalidation: Invalidation, playerStats: PlayerStatLine[], teamStats: TeamStatLine[], gameMode: GameMode
    - public methods: none
  - ScrimMeta (core/src/database/scheduling/saved_scrim/scrim.model.ts)
    - public properties: parent: MatchParent, isCompetitive: boolean
    - public methods: none
  - ScheduleFixture (core/src/database/scheduling/schedule_fixture/schedule_fixture.model.ts)
    - public properties: scheduleGroup: ScheduleGroup, homeFranchise: Franchise, awayFranchise: Franchise, matchParents: MatchParent[], matches: Match[], awayFranchiseId: number, homeFranchiseId: number
    - public methods: none
  - ScheduleGroupType (core/src/database/scheduling/schedule_group_type/schedule_group_type.model.ts)
    - public properties: organization: Organization, name: string, code: string, scheduleGroups: ScheduleGroup[]
    - public methods: none
  - ScheduleGroup (core/src/database/scheduling/schedule_group/schedule_group.model.ts)
    - public properties: start: Date, end: Date, description: string, type: ScheduleGroupType, game: Game, parentGroup: ScheduleGroup, childGroups: ScheduleGroup[], fixtures: ScheduleFixture[]
    - public methods: none
  - ScheduledEvent (core/src/database/scheduling/scheduled_event/scheduled_event.model.ts)
    - public properties: description: string, start: Date, end: Date, url: string, host: Member, gameMode: GameMode, game: Game, matchParents: MatchParent
    - public methods: none
  - TeamStatLine (core/src/database/scheduling/team_stat_line/team_stat_line.model.ts)
    - public properties: stats: unknown, teamName: string, team: Team, round: Round, playerStats: PlayerStatLine[]
    - public methods: none
  - Webhook (core/src/database/webhook/webhook/webhook.model.ts)
    - public properties: url: string, description: string
    - public methods: none
- interfaces:
  - OrganizationConfigurationKeyTypes (core/src/database/configuration/organization_configuration_key/organization_configuration_key.enum.ts) -> [OrganizationConfigurationKeyType.STRING]: string, [OrganizationConfigurationKeyType.INTEGER]: number, [OrganizationConfigurationKeyType.FLOAT]: number, [OrganizationConfigurationKeyType.ARRAY_STRING]: string[]
- enums:
  - OrganizationConfigurationKeyCode (core/src/database/configuration/organization_configuration_key/organization_configuration_key.enum.ts) -> SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES, SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES, SCRIM_QUEUE_BAN_DURATION_MODIFIER, SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS, PRIMARY_DISCORD_GUILD_SNOWFLAKE, ALTERNATE_DISCORD_GUILD_SNOWFLAKES, REPORT_CARD_DISCORD_WEBHOOK_URL, SCRIM_REQUIRED_RATIFICATIONS, SKILL_GROUP_CHANGE_DISCORD_WEBHOOK_URL, TRANSACTIONS_DISCORD_WEBHOOK_URL
  - OrganizationConfigurationKeyType (core/src/database/configuration/organization_configuration_key/organization_configuration_key.enum.ts) -> STRING, INTEGER, FLOAT, ARRAY_STRING
  - FeatureCode (core/src/database/game/feature/feature.enum.ts) -> AUTO_SALARIES, AUTO_RANKOUTS
  - UserRolesType (core/src/database/identity/roles/user_roles_type.enum.ts) -> USER, ADMIN
  - UserAuthenticationAccountType (core/src/database/identity/user_authentication_account/user_authentication_account_type.enum.ts) -> DISCORD, GOOGLE
  - ChannelType (core/src/database/mledb/enums/ChannelType.enum.ts) -> DIRECT_MESSAGE, FALLBACK, GENERAL, DEBUG, OPEN_SCRIMS_DEFAULT, PENDING_SCRIMS_DEFAULT, REPORT_CARD_DEFAULT, OPEN_SCRIMS_FOUNDATION, PENDING_SCRIMS_FOUNDATION, OPEN_SCRIMS_ACADEMY, PENDING_SCRIMS_ACADEMY, OPEN_SCRIMS_CHAMPION, PENDING_SCRIMS_CHAMPION, OPEN_SCRIMS_MASTER, PENDING_SCRIMS_MASTER, OPEN_SCRIMS_PREMIER, PENDING_SCRIMS_PREMIER, LEAGUE_REPORT_CARD_FOUNDATION, LEAGUE_REPORT_CARD_ACADEMY, LEAGUE_REPORT_CARD_CHAMPION, LEAGUE_REPORT_CARD_MASTER, LEAGUE_REPORT_CARD_PREMIER, TRANSACTIONS, MATCH_TIMES, LO_NOTIFS
  - Conference (core/src/database/mledb/enums/Conference.enum.ts) -> BLUE, ORANGE, META
  - EventFormat (core/src/database/mledb/enums/EventFormat.ts) -> FRIENDLY, COMPETITIVE, TOURNAMENT
  - FranchiseStaff (core/src/database/mledb/enums/FranchiseStaff.enum.ts) -> FRANCHISE_MANAGER, GENERAL_MANAGER, ASSISTANT_GENERAL_MANAGER, CAPTAIN, PR_SUPPORT, NONE
  - League (core/src/database/mledb/enums/League.enum.ts) -> FOUNDATION, ACADEMY, CHAMPION, MASTER, PREMIER, UNKNOWN
  - RocketLeagueMap (core/src/database/mledb/enums/Map.enum.ts) -> STARBASE_ARC, STARBASE_ARC_STANDARD, CHAMPIONS_FIELD_NFL, SALTY_SHORES_NIGHT, SALTY_SHORES, SALTY_SHORES_VOLLEYBALL, FORBIDDEN_TEMPLE_DAY, FORBIDDEN_TEMPLE, CHAMPIONS_FIELD_DAY, RIVALS_ARENA, CHAMPIONS_FIELD, MANNFIELD_NIGHT, MANNFIELD, MANNFIELD_STORMY, MANNFIELD_SNOWY, FARMSTEAD_NIGHT, FARMSTEAD, FARMSTEAD_UPSIDE_DOWN, URBAN_CENTRAL_HAUNTED, DUNK_HOUSE, NEON_FIELDS, NEO_TOKYO, NEO_TOKYO_STANDARD, BECKWITH_PARK_MIDNIGHT, BECKWITH_PARK, BECKWITH_PARK_STORMY, CORE_707, DFH_STADIUM_DAY, DFH_STADIUM_STORMY, DFH_STADIUM, ... +15 more
  - LegacyGameMode (core/src/database/mledb/enums/Mode.enum.ts) -> SOLO, DOUBLES, STANDARD
  - ModePreference (core/src/database/mledb/enums/ModePreference.enum.ts) -> DOUBLES_ONLY, STANDARD_ONLY, BOTH, PREFER_2S, PREFER_3S
  - MLE_OrganizationTeam (core/src/database/mledb/enums/OrganizationTeam.enum.ts) -> MLEDB_ADMIN, LEADERSHIP, COUNCIL, COORDINATOR, LEAGUE_OPERATIONS, PRODUCTION, MODERATORS, COMMUNITY, MARKETING, STATISTICS, SPONSORSHIP, AFFILIATE_BROADCASTER
  - MLE_Platform (core/src/database/mledb/enums/Platform.enum.ts) -> STEAM, XBOX, PS4, EPIC
  - Role (core/src/database/mledb/enums/Role.enum.ts) -> PlayerA, PlayerB, PlayerC, PlayerD, PlayerE, PlayerF, PlayerG, PlayerH, ReserveA, ReserveB, ReserveC, NONE
  - StreamType (core/src/database/mledb/enums/StreamType.enum.ts) -> COMPETITIVE, FRIENDLY, TOURNAMENT
  - Timezone (core/src/database/mledb/enums/Timezone.enum.ts) -> US_HAWAII, US_ALASKA, US_PACIFIC, US_CENTRAL, US_EAST, US_ATLANTIC, US_MOUNTAIN, EU_WEST, EU_CENTRAL, EU_EAST, OCE_WEST, OCE_CENTRAL, OCE_EAST, OCE_NZ, UNKNOWN
  - MemberRestrictionType (core/src/database/organization/member_restriction/member_restriction_type.enum.ts) -> QUEUE_BAN, RATIFICATION_BAN
- type aliases:
  - BaseModelCore (core/src/database/base-model.ts) -> Omit<BaseModel, IrrelevantFields>
  - ModelLifecycleFields (core/src/database/base-model.ts) -> "createdAt" | "updatedAt" | "deletedAt"
  - MatchSubmissionStatus (core/src/database/scheduling/match/match.model.ts) -> "submitting" | "ratifying" | "completed"

#### Context: elo

- interfaces:
  - JobListenerPayload (core/src/elo/elo-connector/elo-connector.types.ts) -> endpoint: EloEndpoint, success: JobListener<EloEndpoint>, failure: (e: Error) => Promise<void>
  - CurrentEloValues (core/src/elo/elo.service.ts) -> player_id: number, elo: number, league: string, salary: number, name: string
- enums:
  - EloEndpoint (core/src/elo/elo-connector/elo-connector.types.ts) -> CalculateSalaries, CalculateEloForMatch, CalculateEloForNcp, AddNewPlayers, AddPlayerBySalary, SGChange, EloChange, CompactGraph
  - SkillGroup (core/src/elo/elo-connector/schemas/AddPlayers.schema.ts) -> PREMIER, MASTER, CHAMPION, ACADEMY, FOUNDATION
  - GameMode (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> DOUBLES, STANDARD
  - TeamColor (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> ORANGE, BLUE
  - DegreeOfStiffness (core/src/elo/elo-connector/schemas/CalculateSalaries.schema.ts) -> SOFT, HARD
  - SkillGroupDelta (core/src/elo/elo-connector/schemas/CalculateSalaries.schema.ts) -> UP, DOWN
- type aliases:
  - EloInput (core/src/elo/elo-connector/elo-connector.types.ts) -> z.infer<typeof EloSchemas[T]["input"]>
  - EloOutput (core/src/elo/elo-connector/elo-connector.types.ts) -> z.infer<typeof EloSchemas[T]["output"]>
  - JobListener (core/src/elo/elo-connector/elo-connector.types.ts) -> (d: EloOutput<E>) => Promise<void>
  - NewPlayerBySalary (core/src/elo/elo-connector/schemas/AddPlayerBySalary.schema.ts) -> z.infer<typeof NewPlayerBySalarySchema>
  - NewPlayer (core/src/elo/elo-connector/schemas/AddPlayers.schema.ts) -> z.infer<typeof NewPlayerSchema>
  - CalculateEloForMatchInput (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> z.infer<typeof CalculateEloForMatch_Input>
  - MatchSummary (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> z.infer<typeof MatchSummarySchema>
  - PlayerSummary (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> z.infer<typeof PlayerSummarySchema>
  - RoundMetadata (core/src/elo/elo-connector/schemas/CalculateEloForMatch.schema.ts) -> z.infer<typeof RoundMetadataSchema>
  - SalaryPayloadItem (core/src/elo/elo-connector/schemas/CalculateSalaries.schema.ts) -> z.infer<typeof SalaryPayloadItemSchema>
  - ManualEloChange (core/src/elo/elo-connector/schemas/ManualEloChange.schema.ts) -> z.infer<typeof ManualEloChangeSchema>
  - ManualSkillGroupChange (core/src/elo/elo-connector/schemas/ManualRankout.schema.ts) -> z.infer<typeof ManualSkillGroupChangeSchema>

#### Context: franchise

- classes:
  - CreatePlayerTuple (core/src/franchise/player/player.types.ts)
    - public properties: gameSkillGroupId: number, salary: number
    - public methods: none
  - OperationError (core/src/franchise/player/player.types.ts)
    - public properties: message: string, code: number
    - public methods: none
- interfaces:
  - GameAndOrganization (core/src/franchise/player/player.types.ts) -> gameId: number, organizationId: number
- type aliases:
  - RankdownJwtPayload (core/src/franchise/player/player.types.ts) -> z.infer<typeof RankdownJwtPayloadSchema>

#### Context: identity

- classes:
  - GqlJwtGuard (core/src/identity/auth/gql-auth-guard/gql-jwt-guard.ts)
    - public properties: none
    - public methods: getRequest(context: ExecutionContext): unknown, canActivate(context: ExecutionContext): boolean | Promise<boolean>
  - DiscordStrategy (core/src/identity/auth/oauth/strategies/discord.strategy.ts)
    - public properties: none
    - public methods: validate(accessToken: string, refreshToken: string, profile: Profile, done: Done): Promise<User | undefined>
  - GoogleStrategy (core/src/identity/auth/oauth/strategies/google.strategy.ts)
    - public properties: none
    - public methods: validate(accessToken: string, refreshToken: string, profile: GoogleProfileType, done: VerifyCallback): Promise<User | undefined>
  - JwtRefreshStrategy (core/src/identity/auth/oauth/strategies/oauth.jwt.refresh.strategy.ts)
    - public properties: none
    - public methods: validate(payload: AuthPayload): Promise<UserPayload>
  - JwtStrategy (core/src/identity/auth/oauth/strategies/oauth.jwt.strategy.ts)
    - public properties: none
    - public methods: validate(payload: AuthPayload): Promise<UserPayload>
  - AccessToken (core/src/identity/auth/oauth/types/accesstoken.type.ts)
    - public properties: access_token: string, refresh_token: string
    - public methods: none
  - AuthPayload (core/src/identity/auth/oauth/types/payload.type.ts)
    - public properties: sub: string, username: string, userId: number, currentOrganizationId: number, orgTeams: MLE_OrganizationTeam[]
    - public methods: none
  - GoogleProfileType (core/src/identity/auth/oauth/types/profile.type.ts)
    - public properties: name: { givenName: string; familyName: string; }, emails: Array<{ value: string; }>, photos: Array<{ value: string; }>
    - public methods: none
  - UserPayload (core/src/identity/auth/oauth/types/userpayload.type.ts)
    - public properties: userId: number, username: string, currentOrganizationId: number, orgTeams: MLE_OrganizationTeam[]
    - public methods: none
- type aliases:
  - Done (core/src/identity/auth/oauth/strategies/discord.strategy.ts) -> (err: string, user: User) => void

#### Context: mledb

- type aliases:
  - OrganizationTeamGuardOptions (core/src/mledb/mledb-player/mle-organization-team.guard.ts) -> | MLE_OrganizationTeam | MLE_OrganizationTeam[] | ((orgTeams: MLE_OrganizationTeam[]) => boolean)

#### Context: organization

- classes:
  - MemberRestrictionEvent (core/src/organization/member-restriction/member-restriction.types.ts)
    - public properties: eventType: number
    - public methods: none
  - OrganizationProfileInput (core/src/organization/organization/inputs/organization_profile.input.ts)
    - public properties: websiteUrl: string, logoUrl: string, primaryColor: string, secondaryColor: string
    - public methods: none

#### Context: replay-parse

- classes:
  - ParseReplayResult (core/src/replay-parse/types/replay-parse.types.ts)
    - public properties: parser: Parser, parserVersion: number, outputPath: string, data: BallchasingResponse | CarballResponse
    - public methods: none
  - ReplayParseProgress (core/src/replay-parse/types/replay-parse.types.ts)
    - public properties: taskId: string, status: ProgressStatus, progress: IProgress, result: ParseReplayResult | null, filename: string, error: string | null
    - public methods: none
  - GqlRatifierInfo (core/src/replay-parse/types/replay-submission.types.ts)
    - public properties: playerId: number, franchiseId: number, franchiseName: string, ratifiedAt: string
    - public methods: none
  - GqlReplaySubmission (core/src/replay-parse/types/replay-submission.types.ts)
    - public properties: id: string, creatorId: number, taskIds: string[], status: ReplaySubmissionStatus, items: ReplaySubmissionItem[], validated: boolean, stats: ReplaySubmissionStats, ratifications: number, requiredRatifications: number, userHasRatified: boolean, rejections: SubmissionRejection[], type: ReplaySubmissionType, scrimId: Scrim["id"], matchId: Match["id"], ratifiers: GqlRatifierInfo[] | number[]
    - public methods: none
  - LFSReplaySubmission (core/src/replay-parse/types/replay-submission.types.ts)
    - public properties: type: ReplaySubmissionType.LFS, scrimId: Scrim["id"]
    - public methods: none
  - MatchReplaySubmission (core/src/replay-parse/types/replay-submission.types.ts)
    - public properties: type: ReplaySubmissionType.MATCH, matchId: Match["id"]
    - public methods: none
  - ScrimReplaySubmission (core/src/replay-parse/types/replay-submission.types.ts)
    - public properties: type: ReplaySubmissionType.SCRIM, scrimId: Scrim["id"]
    - public methods: none
  - ReplaySubmissionItem (core/src/replay-parse/types/submission-item.types.ts)
    - public properties: taskId: string, originalFilename: string, progress: SubmissionProgressMessage, inputPath: string, outputPath: string
    - public methods: none
  - SubmissionProgressMessage (core/src/replay-parse/types/submission-item.types.ts)
    - public properties: error: string | null, progress: GqlProgress, status: ProgressStatus, taskId: string, result: ProgressMessage<Task.ParseReplay>["result"]
    - public methods: none
  - SubmissionRejection (core/src/replay-parse/types/submission-rejection.types.ts)
    - public properties: playerId: number, playerName: string, reason: string, stale: boolean, rejectedAt: string, rejectedItems: RejectedItem[]
    - public methods: none
  - ReplaySubmissionGame (core/src/replay-parse/types/submission-stats.types.ts)
    - public properties: teams: ReplaySubmissionTeam[]
    - public methods: none
  - ReplaySubmissionPlayer (core/src/replay-parse/types/submission-stats.types.ts)
    - public properties: name: string, stats: Record<string, number>
    - public methods: none
  - ReplaySubmissionStats (core/src/replay-parse/types/submission-stats.types.ts)
    - public properties: games: ReplaySubmissionGame[]
    - public methods: none
  - ReplaySubmissionTeam (core/src/replay-parse/types/submission-stats.types.ts)
    - public properties: players: ReplaySubmissionPlayer[], result: string, score: number, stats: Record<string, number>
    - public methods: none
  - FranchiseInfo (core/src/replay-parse/types/validation-result.types.ts)
    - public properties: id: number, name: string
    - public methods: none
  - FranchiseValidationResult (core/src/replay-parse/types/validation-result.types.ts)
    - public properties: eligible: boolean, eligibleFranchise: FranchiseInfo, existingFranchises: FranchiseInfo[], requiredFranchises: number, currentFranchiseCount: number, canRatify: boolean, reason: string
    - public methods: none
  - ValidationError (core/src/replay-parse/types/validation-result.types.ts)
    - public properties: error: string, gameIndex: number, teamIndex: number, playerIndex: number
    - public methods: none
  - ValidationFailure (core/src/replay-parse/types/validation-result.types.ts)
    - public properties: valid: false, errors: ValidationError[], franchiseValidation: FranchiseValidationResult
    - public methods: none
  - ValidationSuccess (core/src/replay-parse/types/validation-result.types.ts)
    - public properties: valid: true, franchiseValidation: FranchiseValidationResult
    - public methods: none
- interfaces:
  - SaveMatchFinalizationReturn (core/src/replay-parse/finalization/finalization.types.ts) -> match: Match, legacyMatch: MLE_Series
  - SaveScrimFinalizationReturn (core/src/replay-parse/finalization/finalization.types.ts) -> scrim: ScrimMeta, legacyScrim: MLE_Scrim
- enums:
  - ReplaySubmissionType (core/src/replay-parse/types/replay-submission.types.ts) -> MATCH, SCRIM, LFS
- type aliases:
  - ParseReplaysTasks (core/src/replay-parse/types/replay-parse.types.ts) -> Record< string, { status: ProgressStatus; result: ParseReplayResult | null; error: Error | null; } >
  - ReplaySubmission (core/src/replay-parse/types/replay-submission.types.ts) -> MatchReplaySubmission | ScrimReplaySubmission | LFSReplaySubmission
  - RejectedItem (core/src/replay-parse/types/submission-rejection.types.ts) -> Omit<ReplaySubmissionItem, "progress">
  - ValidationResult (core/src/replay-parse/types/validation-result.types.ts) -> ValidationSuccess | ValidationFailure

#### Context: scheduling

- type aliases:
  - MatchParentResponse (core/src/scheduling/match/match.service.ts) -> | { type: "fixture"; data: ScheduleFixture; } | { type: "scrim"; data: ScrimMeta; } | { type: "event"; data: ScheduledEvent; }
  - RawFixture (core/src/scheduling/schedule-group/schedule-groups.types.ts) -> z.infer<typeof RawFixtureSchema>

#### Context: scrim

- classes:
  - CreateLFSScrimInput (core/src/scrim/types/CreateLFSScrimInput.ts)
    - public properties: gameModeId: number, settings: ScrimSettingsInput, createGroup: boolean, leaveAfter: number, numRounds: number
    - public methods: none
  - CreateScrimInput (core/src/scrim/types/CreateScrimInput.ts)
    - public properties: gameModeId: number, settings: ScrimSettingsInput, createGroup: boolean, leaveAfter: number
    - public methods: none
  - Scrim (core/src/scrim/types/Scrim.ts)
    - public properties: id: string, createdAt: Date, updatedAt: Date, status: ScrimStatus, authorId: number, organizationId: number, gameModeId: number, gameMode: GameMode, skillGroupId: number, skillGroup: GameSkillGroup, submissionId: string, players: ScrimPlayer[], games: ScrimGame[], lobby: ScrimLobby, settings: ScrimSettings, currentGroup: ScrimGroup, playerCount: number, maxPlayers: number
    - public methods: none
  - ScrimEvent (core/src/scrim/types/Scrim.ts)
    - public properties: scrim: Scrim, event: EventTopic
    - public methods: none
  - ScrimGameMode (core/src/scrim/types/Scrim.ts)
    - public properties: id: number, description: string
    - public methods: none
  - ScrimGroup (core/src/scrim/types/Scrim.ts)
    - public properties: code: string, players: string[]
    - public methods: none
  - ScrimGame (core/src/scrim/types/ScrimGame.ts)
    - public properties: teams: ScrimTeam[]
    - public methods: none
  - ScrimLobby (core/src/scrim/types/ScrimLobby.ts)
    - public properties: name: string, password: string
    - public methods: none
  - ScrimMetrics (core/src/scrim/types/ScrimMetrics.ts)
    - public properties: pendingScrims: number, playersQueued: number, playersScrimming: number, totalPlayers: number, totalScrims: number, completedScrims: number, previousCompletedScrims: number
    - public methods: none
  - ScrimPlayer (core/src/scrim/types/ScrimPlayer.ts)
    - public properties: id: number, name: string, joinedAt: Date, leaveAt: Date, group: string, checkedIn: boolean
    - public methods: none
  - ScrimSettings (core/src/scrim/types/ScrimSettings.ts)
    - public properties: teamSize: number, teamCount: number, mode: ScrimMode, competitive: boolean, observable: boolean, lfs: boolean, checkinTimeout: number
    - public methods: none
  - ScrimSettingsInput (core/src/scrim/types/ScrimSettings.ts)
    - public properties: mode: ScrimMode, competitive: boolean, observable: boolean, lfs: boolean
    - public methods: none
  - ScrimTeam (core/src/scrim/types/ScrimTeam.ts)
    - public properties: players: ScrimPlayer[]
    - public methods: none

#### Context: sprocket-rating

- interfaces:
  - SprocketRating (core/src/sprocket-rating/sprocket-rating.types.ts) -> opi: number, dpi: number, gpi: number
  - SprocketRatingInput (core/src/sprocket-rating/sprocket-rating.types.ts) -> goals: number, assists: number, shots: number, saves: number, goals_against: number, shots_against: number, team_size?: number

#### Context: util

- classes:
  - GqlProgress (core/src/util/types/celery-progress.ts)
    - public properties: value: number, message: string
    - public methods: none
- enums:
  - Period (core/src/util/types/period.enum.ts) -> HOUR, DAY
- type aliases:
  - DeepOmit (core/src/util/types/ts.ts) -> Prettify< DeepOmitRequired<T, KeysToOmit> & DeepOmitOptional<T, KeysToOmit> >
  - Prettify (core/src/util/types/ts.ts) -> T extends infer U ? { [K in keyof U]: Prettify<U[K]>} : never
  - Primitive (core/src/util/types/ts.ts) -> string | Function | number | boolean | Symbol | undefined | null

## Workspace: common

- Files parsed: 115
- Exported entities: 214
- Module classes: 13
- Runtime classes: 13
- Data/interface entities: 188

### Module Definitions

- **CeleryModule** (common/src/celery/celery.module.ts)
  - imports: none
  - providers: CeleryService
  - controllers: none
  - exports: CeleryService
- **EventsModule** (common/src/events/events.module.ts)
  - imports: none
  - providers: EventsService, RmqService
  - controllers: none
  - exports: EventsService
- **GlobalModule** (common/src/global.module.ts)
  - imports: client
  - providers: none
  - controllers: none
  - exports: client
- **MinioModule** (common/src/minio/minio.module.ts)
  - imports: none
  - providers: MinioService
  - controllers: none
  - exports: MinioService
- **RedisModule** (common/src/redis/redis.module.ts)
  - imports: none
  - providers: RedisService
  - controllers: none
  - exports: RedisService
- **AnalyticsModule** (common/src/service-connectors/analytics/analytics.module.ts)
  - imports: GlobalModule
  - providers: AnalyticsService
  - controllers: none
  - exports: AnalyticsService
- **BotModule** (common/src/service-connectors/bot/bot.module.ts)
  - imports: GlobalModule
  - providers: BotService
  - controllers: none
  - exports: BotService
- **CoreModule** (common/src/service-connectors/core/core.module.ts)
  - imports: ClientsModule.register(...)
  - providers: CoreService
  - controllers: none
  - exports: CoreService
- **ImageGenerationModule** (common/src/service-connectors/image-generation/image-generation.module.ts)
  - imports: GlobalModule
  - providers: ImageGenerationService
  - controllers: none
  - exports: ImageGenerationService
- **MatchmakingModule** (common/src/service-connectors/matchmaking/matchmaking.module.ts)
  - imports: GlobalModule
  - providers: MatchmakingService
  - controllers: none
  - exports: MatchmakingService
- **NotificationModule** (common/src/service-connectors/notification/notification.module.ts)
  - imports: GlobalModule
  - providers: NotificationService
  - controllers: none
  - exports: NotificationService
- **SubmissionModule** (common/src/service-connectors/submission/submission.module.ts)
  - imports: none
  - providers: SubmissionService
  - controllers: none
  - exports: SubmissionService
- **CachingModule** (common/src/util/caching/caching.module.ts)
  - imports: none
  - providers: none
  - controllers: none
  - exports: none

### Runtime Classes (Public Methods)

#### Context: celery

- **CeleryService** (service; common/src/celery/celery.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: onApplicationBootstrap(): Promise<void>, runSync(task: T, args: TaskArgs<T>): Promise<TaskResult<T>>, run(task: T, args: TaskArgs<T>, opts?: RunOpts<T>): Promise<string>, parseResult(task: T, result: unknown): TaskResult<T>, subscribe(task: T, queue: string): Observable<ProgressMessage<T>>, buildResultKey(taskId: string): string

#### Context: converters

- **CarballConverterService** (service; common/src/converters/carball-converter.service.ts)
  - decorators: none
  - dependencies: none
  - public methods: convertToBallchasingFormat(carball: CarballResponse, outputPath: string): BallchasingResponse

#### Context: events

- **EventsService** (service; common/src/events/events.service.ts)
  - decorators: Injectable
  - dependencies: rmqService: RmqService
  - public methods: subscribe(topic: T, instanceExclusive: boolean, subtopic: string): Promise<Observable<EventResponse<T>>>, publish(topic: T, payload: EventPayload<T>, subtopic: string): Promise<boolean>
- **RmqService** (service; common/src/events/rmq.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: conn(): Connection, onApplicationBootstrap(): Promise<void>, pub(topic: string, data: Buffer): Promise<boolean>, sub(topic: string, instanceExclusive: boolean): Promise<Observable<ConsumeMessage>>

#### Context: minio

- **MinioService** (service; common/src/minio/minio.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: put(bucket: string, objectPath: string, object: Buffer | string): Promise<void>, get(bucket: string, objectPath: string): Promise<Readable>

#### Context: redis

- **RedisService** (service; common/src/redis/redis.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: redis(): Redis, redisOptions(): RedisOptions, onApplicationBootstrap(): Promise<void>, setJson(key: string, input: T): Promise<void>, setJsonField(key: string, path: string, input: T): Promise<void>, getJson(key: string, path?: string, schema?: S): Promise<T>, getJsonIfExists(key: string, schema?: S): Promise<T | null>, getIfExists(key: string): Promise<T | undefined>, getString(key: string): Promise<T | null>, appendToJsonArray(key: string, path: string, value: T): Promise<void>, deleteJsonField(key: string, path: string): Promise<void>, deleteJson(key: string): Promise<void>, getKeys(pattern: string): Promise<string[]>, keyExists(key: string): Promise<boolean>, set(key: string, value: string): Promise<void>, get(key: string): Promise<string | null>, delete(key: string): Promise<void>

#### Context: service-connectors

- **AnalyticsService** (service; common/src/service-connectors/analytics/analytics.service.ts)
  - decorators: Injectable
  - dependencies: microServiceClient: ClientProxy
  - public methods: send(endpoint: E, data: AnalyticsInput<E>, options?: MicroserviceRequestOptions): Promise<AnalyticsResponse<E>>, parseInput(endpoint: E, data: unknown): AnalyticsInput<E>
- **BotService** (service; common/src/service-connectors/bot/bot.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: BotInput<E>, options?: MicroserviceRequestOptions): Promise<BotResponse<E>>, parseInput(endpoint: E, data: unknown): BotInput<E>
- **CoreService** (service; common/src/service-connectors/core/core.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: CoreInput<E>, options?: MicroserviceRequestOptions): Promise<CoreResponse<E>>, parseInput(endpoint: E, data: unknown): CoreInput<E>
- **ImageGenerationService** (service; common/src/service-connectors/image-generation/image-generation.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: ImageGenerationInput<E>, options?: MicroserviceRequestOptions): Promise<ImageGenerationResponse<E>>, parseInput(endpoint: E, data: unknown): ImageGenerationInput<E>
- **MatchmakingService** (service; common/src/service-connectors/matchmaking/matchmaking.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: MatchmakingInput<E>, options?: MicroserviceRequestOptions): Promise<MatchmakingResponse<E>>, parseInput(endpoint: E, data: unknown): MatchmakingInput<E>
- **NotificationService** (service; common/src/service-connectors/notification/notification.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: NotificationInput<E>, options?: MicroserviceRequestOptions): Promise<NotificationResponse<E>>, parseInput(endpoint: E, data: unknown): NotificationInput<E>
- **SubmissionService** (service; common/src/service-connectors/submission/submission.service.ts)
  - decorators: Injectable
  - dependencies: microserviceClient: ClientProxy
  - public methods: send(endpoint: E, data: SubmissionInput<E>, options?: MicroserviceRequestOptions): Promise<SubmissionResponse<E>>, parseInput(endpoint: E, data: unknown): SubmissionInput<E>

### Data Contracts and Interfaces

#### Context: celery

- interfaces:
  - Progress (common/src/celery/types/progress.types.ts) -> value: number, message: string
  - ProgressMessage (common/src/celery/types/progress.types.ts) -> taskId: string, status: ProgressStatus, progress: Progress, result: TaskResult<T> | null, error: string | null
  - AllTaskArgs (common/src/celery/types/task.types.ts) -> progressQueue?: string
  - RunOpts (common/src/celery/types/task.types.ts) -> taskId?: string, progressQueue?: string, cb?: (taskId: string, result: TaskResult<T> | null, error: Error | null) => void | Promise<void>
- enums:
  - ProgressStatus (common/src/celery/types/progress.types.ts) -> Pending, Complete, Error
  - Parser (common/src/celery/types/schemas/parse-replay.schema.ts) -> CARBALL, BALLCHASING
  - Task (common/src/celery/types/task.types.ts) -> ParseReplay
- type aliases:
  - ParsedReplay (common/src/celery/types/schemas/parse-replay.schema.ts) -> z.infer<typeof ParseReplay_Response>
  - BallchasingPlayer (common/src/celery/types/schemas/stats/ballchasing/ballchasing-player.schema.ts) -> z.infer<typeof BallchasingPlayerSchema>
  - BallchasingPlayerStates (common/src/celery/types/schemas/stats/ballchasing/ballchasing-player.schema.ts) -> z.infer<typeof BallchasingPlayerStatsSchema>
  - BallchasingTeam (common/src/celery/types/schemas/stats/ballchasing/ballchasing-team.schema.ts) -> z.infer<typeof BallchasingTeamSchema>
  - BallchasingTeamState (common/src/celery/types/schemas/stats/ballchasing/ballchasing-team.schema.ts) -> z.infer<typeof BallchasingTeamSchema>
  - BallchasingResponse (common/src/celery/types/schemas/stats/ballchasing/ballchasing.schema.ts) -> z.infer<typeof BallchasingResponseSchema>
  - BallchasingUploader (common/src/celery/types/schemas/stats/ballchasing/ballchasing.schema.ts) -> z.infer<typeof BallchasingUploaderSchema>
  - CarballPlayer (common/src/celery/types/schemas/stats/carball/carball-player.schema.ts) -> z.infer<typeof CarballPlayerSchema>
  - CarballPlayerStats (common/src/celery/types/schemas/stats/carball/carball-player.schema.ts) -> z.infer<typeof CarballPlayerStatsSchema>
  - PlayerId (common/src/celery/types/schemas/stats/carball/carball-player.schema.ts) -> z.infer<typeof PlayerIdSchema>
  - CarballTeam (common/src/celery/types/schemas/stats/carball/carball-team.schema.ts) -> z.infer<typeof CarballTeamSchema>
  - CarballTeamStats (common/src/celery/types/schemas/stats/carball/carball-team.schema.ts) -> z.infer<typeof CarballTeamStatsSchema>
  - CarballGameMetadata (common/src/celery/types/schemas/stats/carball/carball.schema.ts) -> z.infer<typeof CarballGameMetadataSchema>
  - CarballGameStats (common/src/celery/types/schemas/stats/carball/carball.schema.ts) -> z.infer<typeof CarballGameStatsSchema>
  - CarballParty (common/src/celery/types/schemas/stats/carball/carball.schema.ts) -> z.infer<typeof CarballPartySchema>
  - CarballResponse (common/src/celery/types/schemas/stats/carball/carball.schema.ts) -> z.infer<typeof CarballResponseSchema>
  - TaskArgs (common/src/celery/types/task.types.ts) -> z.infer<typeof TaskSchemas[T]["args"]> & AllTaskArgs
  - TaskResult (common/src/celery/types/task.types.ts) -> z.infer<typeof TaskSchemas[T]["result"]>

#### Context: events

- classes:
  - SprocketEventMarshal (common/src/events/marshal/marshal.ts)
    - public properties: logger
    - public methods: onApplicationBootstrap(): Promise<void>
- interfaces:
  - EventResponse (common/src/events/events.types.ts) -> topic: T, payload: EventPayload<T>
- enums:
  - EventTopic (common/src/events/events.types.ts) -> AllScrimEvents, ScrimComplete, ScrimPopped, ScrimCreated, ScrimUpdated, ScrimDestroyed, ScrimStarted, ScrimCancelled, ScrimMetricsUpdate, ScrimSaved, ScrimsDisabled, MatchSaved, AllSubmissionEvents, SubmissionStarted, SubmissionProgress, SubmissionValidating, SubmissionRatifying, SubmissionRatificationAdded, SubmissionRatified, SubmissionRejectionAdded, SubmissionRejected, SubmissionReset, SubmissionUpdated, AllMemberEvents, MemberRestrictionCreated, MemberRestrictionExpired, PlayerSkillGroupChanged, PlayerTeamChanged
- type aliases:
  - EventPayload (common/src/events/events.types.ts) -> z.infer<typeof EventSchemas[T]>
  - EventFunction (common/src/events/marshal/marshal.types.ts) -> ( data: EventPayload<Event>, ) => void | Promise<void>
  - EventMeta (common/src/events/marshal/marshal.types.ts) -> z.infer<typeof EventMetaSchema>
  - MatchDatabaseIds (common/src/events/types/match-database-ids.schema.ts) -> z.infer<typeof MatchDatabaseIdsSchema>
  - ScrimDatabaseIds (common/src/events/types/scrim-database-ids.schema.ts) -> z.infer<typeof ScrimDatabaseIdsSchema>
  - PlayerSkillGroupChangedType (common/src/events/types/skill-group-changed.schema.ts) -> z.infer<typeof PlayerSkillGroupChanged>
  - PlayerTeamChanged (common/src/events/types/team-changed.schema.ts) -> z.infer<typeof PlayerTeamChangedSchema>

#### Context: filters

- classes:
  - AllExceptionsFilter (common/src/filters/all-exceptions.filter.ts)
    - public properties: none
    - public methods: catch(exception: unknown, host: ArgumentsHost): void

#### Context: global.types.ts

- interfaces:
  - MicroserviceRequestOptions (common/src/global.types.ts) -> timeout?: number
- enums:
  - CommonClient (common/src/global.types.ts) -> Bot, Analytics, Matchmaking, ImageGeneration, Notification, Core, Submission
  - ResponseStatus (common/src/global.types.ts) -> SUCCESS, ERROR

#### Context: minio

- interfaces:
  - MinioError (common/src/minio/minio.errors.ts) -> code: MinioErrorCode, message: string, resource: string, requestid: string
- enums:
  - MinioErrorCode (common/src/minio/minio.errors.ts) -> AccessControlListNotSupported, AccessDenied, AccessPointAlreadyOwnedByYou, AccountProblem, AllAccessDisabled, AmbiguousGrantByEmailAddress, AuthorizationHeaderMalformed, BadDigest, BucketAlreadyExists, BucketAlreadyOwnedByYou, BucketNotEmpty, ClientTokenConflict, CredentialsNotSupported, CrossLocationLoggingProhibited, EntityTooSmall, EntityTooLarge, ExpiredToken, IllegalLocationConstraintException, IllegalVersioningConfigurationException, IncompleteBody, IncorrectNumberOfFilesInPostRequest, InlineDataTooLarge, InternalError, InvalidAccessKeyId, InvalidAccessPoint, InvalidAccessPointAliasError, InvalidAddressingHeader, InvalidArgument, InvalidBucketAclWithObjectOwnership, InvalidBucketName, ... +71 more

#### Context: service-connectors

- interfaces:
  - AnalyticsErrorResponse (common/src/service-connectors/analytics/analytics.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - AnalyticsSuccessResponse (common/src/service-connectors/analytics/analytics.types.ts) -> status: ResponseStatus.SUCCESS, data: AnalyticsOutput<T>
  - BotErrorResponse (common/src/service-connectors/bot/bot.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - BotSuccessResponse (common/src/service-connectors/bot/bot.types.ts) -> status: ResponseStatus.SUCCESS, data: BotOutput<T>
  - CoreErrorResponse (common/src/service-connectors/core/core.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - CoreSuccessResponse (common/src/service-connectors/core/core.types.ts) -> status: ResponseStatus.SUCCESS, data: CoreOutput<T>
  - ImageGenerationErrorResponse (common/src/service-connectors/image-generation/image-generation.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - ImageGenerationSuccessResponse (common/src/service-connectors/image-generation/image-generation.types.ts) -> status: ResponseStatus.SUCCESS, data: ImageGenerationOutput<T>
  - MatchmakingErrorResponse (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - MatchmakingSuccessResponse (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> status: ResponseStatus.SUCCESS, data: MatchmakingOutput<T>
  - NotificationErrorResponse (common/src/service-connectors/notification/notification.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - NotificationSuccessResponse (common/src/service-connectors/notification/notification.types.ts) -> status: ResponseStatus.SUCCESS, data: NotificationOutput<T>
  - SubmissionErrorResponse (common/src/service-connectors/submission/submission.types.ts) -> status: ResponseStatus.ERROR, error: Error
  - SubmissionSuccessResponse (common/src/service-connectors/submission/submission.types.ts) -> status: ResponseStatus.SUCCESS, data: SubmissionOutput<T>
  - EnhancedBaseReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> id: string, creatorId: number, status: ReplaySubmissionStatus, taskIds: string[], items: ReplaySubmissionItem[], validated: boolean, stats?: ReplaySubmissionStats, ratifiers: RatifierInfo[], requiredRatifications: number, rejections: ReplaySubmissionRejection[], franchiseValidation: FranchiseValidationContext
  - EnhancedLFSReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> type: ReplaySubmissionType.LFS, scrimId: string
  - EnhancedMatchReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> type: ReplaySubmissionType.MATCH, matchId: number
  - EnhancedScrimReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> type: ReplaySubmissionType.SCRIM, scrimId: string
  - CrossFranchiseValidationError (common/src/service-connectors/submission/types/franchise-validation.ts) -> code: string, message: string, context?: { submissionId: string; playerId: number; memberId?: number; submissionType?: string; existingFranchises?: number[]; playerFranchises?: FranchiseInfo[]; requiredFranchises?: number; }
  - EnhancedCanRatifySubmissionResponse (common/src/service-connectors/submission/types/franchise-validation.ts) -> canRatify: boolean, reason?: string, franchiseInfo?: { eligibleFranchise: FranchiseInfo; existingFranchises: FranchiseInfo[]; requiredFranchises: number; }
  - FranchiseInfo (common/src/service-connectors/submission/types/franchise-validation.ts) -> id: number, name: string
  - FranchiseValidationContext (common/src/service-connectors/submission/types/franchise-validation.ts) -> homeFranchiseId?: number, awayFranchiseId?: number, requiredFranchises: number, currentFranchiseCount: number
  - FranchiseValidationResult (common/src/service-connectors/submission/types/franchise-validation.ts) -> valid: boolean, reason?: string, franchise?: FranchiseInfo
  - RatifierInfo (common/src/service-connectors/submission/types/ratifier-info.ts) -> playerId: number, franchiseId: number, franchiseName: string, ratifiedAt: string
  - ReplayParseTask (common/src/service-connectors/submission/types/replay-parse-task.ts) -> status: ProgressStatus, result: TaskResult<Task.ParseReplay> | null, error: Error | null, taskId: string
  - ReplaySubmissionItem (common/src/service-connectors/submission/types/replay-submission-item.ts) -> taskId: string, originalFilename: string, inputPath: string, outputPath?: string, progress?: ProgressMessage<Task.ParseReplay>
  - ReplaySubmissionRejection (common/src/service-connectors/submission/types/replay-submission-rejection.ts) -> playerId: number, reason: string, rejectedItems: RejectedItem[], rejectedAt: string, stale: boolean
  - ReplaySubmissionStats (common/src/service-connectors/submission/types/replay-submission-stats.ts) -> games: Array<{ teams: Array<{ result?: ReplaySubmissionTeamResult; score?: number; stats?: Record<string, number>; players: Array<{ name: string; stats?: Record<string, number>; }>; }>; }>
  - BaseReplaySubmission (common/src/service-connectors/submission/types/replay-submission.ts) -> id: string, creatorId: number, status: ReplaySubmissionStatus, taskIds: string[], items: ReplaySubmissionItem[], validated: boolean, stats?: ReplaySubmissionStats, ratifiers: number[], requiredRatifications: number, rejections: ReplaySubmissionRejection[]
  - LFSReplaySubmission (common/src/service-connectors/submission/types/replay-submission.ts) -> type: ReplaySubmissionType.LFS, scrimId: string
  - MatchReplaySubmission (common/src/service-connectors/submission/types/replay-submission.ts) -> type: ReplaySubmissionType.MATCH, matchId: number
  - ScrimReplaySubmission (common/src/service-connectors/submission/types/replay-submission.ts) -> type: ReplaySubmissionType.SCRIM, scrimId: string
- enums:
  - AnalyticsEndpoint (common/src/service-connectors/analytics/analytics.types.ts) -> Analytics
  - BotEndpoint (common/src/service-connectors/bot/bot.types.ts) -> SendGuildTextMessage, SendDirectMessage, SendWebhookMessage
  - ButtonComponentStyle (common/src/service-connectors/bot/types/Component.ts) -> PRIMARY, SECONDARY, SUCCESS, DANGER, LINK
  - ComponentType (common/src/service-connectors/bot/types/Component.ts) -> ACTION_ROW, BUTTON, SELECT_MENU, TEXT_INPUT
  - CoreEndpoint (common/src/service-connectors/core/core.types.ts) -> GetDiscordIdByUser, GetSprocketConfiguration, GetOrganizationProfile, GetUserByAuthAccount, GetMember, GetPlayerByPlatformId, GetPlayersByPlatformIds, GetOrganizationDiscordGuildsByGuild, GenerateReportCard, GetOrganizationConfigurationValue, GetOrganizationByDiscordGuild, GetFranchiseProfile, GetGameSkillGroupProfile, GetScrimReportCardWebhooks, GetMatchReportCardWebhooks, GetUsersLatestScrim, GetMleMatchInfoAndStakeholders, GetGuildsByOrganizationId, GetMatchBySubmissionId, GetMatchById, GetFranchiseStaff, GetPlayerFranchises, GetTransactionsDiscordWebhook, GetSkillGroupWebhooks, GetMatchInformationAndStakeholders, GetGameModeById, GetGameByGameMode, GetNicknameByDiscordUser
  - GenerateReportCardType (common/src/service-connectors/core/schemas/GenerateReportCard.schema.ts) -> SCRIM, SERIES
  - OrganizationConfigurationKeyCode (common/src/service-connectors/core/schemas/GetOrganizationConfiguration.ts) -> SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES, SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES, SCRIM_QUEUE_BAN_DURATION_MODIFIER, SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS, PRIMARY_DISCORD_GUILD_SNOWFLAKE, ALTERNATE_DISCORD_GUILD_SNOWFLAKES, REPORT_CARD_DISCORD_WEBHOOK_URL, SCRIM_REQUIRED_RATIFICATIONS
  - SprocketConfigurationKey (common/src/service-connectors/core/schemas/GetSprocketConfiguration.schema.ts) -> DISABLE_DISCORD_DMS
  - MemberRestrictionType (common/src/service-connectors/core/schemas/MemberRestriction.schema.ts) -> QUEUE_BAN, RATIFICATION_BAN
  - ImageGenerationEndpoint (common/src/service-connectors/image-generation/image-generation.types.ts) -> GenerateImage
  - MatchmakingEndpoint (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> GetScrim, GetScrimByPlayer, GetScrimBySubmissionId, GetAllScrims, GetScrimMetrics, CreateLFSScrim, CreateScrim, JoinScrim, LeaveScrim, CheckInToScrim, CompleteScrim, CancelScrim, SetScrimLocked, UpdateLFSScrimPlayers
  - MatchmakingError (common/src/service-connectors/matchmaking/types/MatchmakingError.enum.ts) -> PlayerAlreadyInScrim, PlayerNotInScrim, PlayerAlreadyCheckedIn, ScrimGroupNotSupportedInMode, ScrimNotFound, ScrimAlreadyInProgress, ScrimStatusNotPopped, ScrimSubmissionNotFound, MaxGroupsCreated, GroupNotFound, GroupFull
  - ScrimMode (common/src/service-connectors/matchmaking/types/ScrimMode.ts) -> TEAMS, ROUND_ROBIN
  - ScrimStatus (common/src/service-connectors/matchmaking/types/ScrimStatus.enum.ts) -> PENDING, POPPED, IN_PROGRESS, EMPTY, COMPLETE, CANCELLED, LOCKED
  - NotificationEndpoint (common/src/service-connectors/notification/notification.types.ts) -> SendNotification
  - NotificationMessageType (common/src/service-connectors/notification/schemas/SendNotification/BaseNotification.schema.ts) -> GuildTextMessage, DirectMessage, WebhookMessage
  - NotificationType (common/src/service-connectors/notification/schemas/SendNotification/BaseNotification.schema.ts) -> BASIC, RANKDOWN
  - SubmissionEndpoint (common/src/service-connectors/submission/submission.types.ts) -> GetSubmissionIfExists, GetAllSubmissions, SubmitReplays, MockCompletion, CanSubmitReplays, RatifySubmission, CanRatifySubmission, RejectSubmission, ResetSubmission, RemoveSubmission, GetSubmissionRedisKey, GetSubmissionRejections, ValidateSubmission, EnhancedRatifySubmission, EnhancedCanRatifySubmission, EnhancedRejectSubmission, EnhancedResetSubmission, EnhancedValidateSubmission
  - ReplaySubmissionStatus (common/src/service-connectors/submission/types/replay-submission.ts) -> PROCESSING, RATIFYING, VALIDATING, RATIFIED, REJECTED
  - ReplaySubmissionType (common/src/service-connectors/submission/types/replay-submission.ts) -> MATCH, SCRIM, LFS
- type aliases:
  - AnalyticsInput (common/src/service-connectors/analytics/analytics.types.ts) -> z.infer< typeof AnalyticsSchemas[T]["input"] >
  - AnalyticsOutput (common/src/service-connectors/analytics/analytics.types.ts) -> z.infer< typeof AnalyticsSchemas[T]["output"] >
  - AnalyticsResponse (common/src/service-connectors/analytics/analytics.types.ts) -> | AnalyticsSuccessResponse<T> | AnalyticsErrorResponse
  - BotInput (common/src/service-connectors/bot/bot.types.ts) -> z.infer<typeof BotSchemas[T]["input"]>
  - BotOutput (common/src/service-connectors/bot/bot.types.ts) -> z.infer<typeof BotSchemas[T]["output"]>
  - BotResponse (common/src/service-connectors/bot/bot.types.ts) -> BotSuccessResponse<T> | BotErrorResponse
  - Attachment (common/src/service-connectors/bot/types/Attachment.ts) -> z.infer<typeof AttachmentSchema>
  - BrandingOptions (common/src/service-connectors/bot/types/BrandingOptions.ts) -> z.infer<typeof BrandingOptionsSchema>
  - EmbedBrandingOptions (common/src/service-connectors/bot/types/BrandingOptions.ts) -> z.infer<typeof EmbedBrandingOptionsSchema>
  - Component (common/src/service-connectors/bot/types/Component.ts) -> z.infer<typeof ActionRowComponentSchema>
  - Embed (common/src/service-connectors/bot/types/Embed.ts) -> z.infer<typeof EmbedSchema>
  - MessageContent (common/src/service-connectors/bot/types/MessageContent.ts) -> z.infer<typeof MessageContentSchema>
  - WebhookMessageOptions (common/src/service-connectors/bot/types/WebhookMessageOptions.ts) -> z.infer<typeof WebhookMessageOptionsSchema>
  - CoreInput (common/src/service-connectors/core/core.types.ts) -> z.infer<typeof CoreSchemas[T]["input"]>
  - CoreOutput (common/src/service-connectors/core/core.types.ts) -> z.infer<typeof CoreSchemas[T]["output"]>
  - CoreResponse (common/src/service-connectors/core/core.types.ts) -> CoreSuccessResponse<T> | CoreErrorResponse
  - GenerateReportCardResponse (common/src/service-connectors/core/schemas/GenerateReportCard.schema.ts) -> z.infer<typeof GenerateReportCard_Response>
  - GetDiscordIdByUserResponse (common/src/service-connectors/core/schemas/GetDiscordIdByUser.schema.ts) -> z.infer<typeof GetDiscordIdByUser_Response>
  - GetGameByGameModeResponse (common/src/service-connectors/core/schemas/GetGameByGameMode.schema.ts) -> z.infer<typeof GetGameByGameMode_Response>
  - GetGuildsByOrganizationIdResponse (common/src/service-connectors/core/schemas/GetGuildsByOrganizationId.schema.ts) -> z.infer<typeof GetGuildsByOrganizationId_Response>
  - GetMemberResponse (common/src/service-connectors/core/schemas/GetMember.schema.ts) -> z.infer<typeof GetMember_Response>
  - GetNicknameByDiscordUserResponse (common/src/service-connectors/core/schemas/GetNicknameByDiscordUser.schema.ts) -> z.infer<typeof GetNicknameByDiscordUser_Response>
  - GetOrganizationByDiscordGuildResponse (common/src/service-connectors/core/schemas/GetOrganizationByDiscordGuild.schema.ts) -> z.infer< typeof GetOrganizationByDiscordGuild_Response >
  - GetOrganizationDiscordGuildsByGuildResponse (common/src/service-connectors/core/schemas/GetOrganizationDiscordGuildsByGuild.schema.ts) -> z.infer< typeof GetOrganizationDiscordGuildsByGuild_Response >
  - GetPlayer (common/src/service-connectors/core/schemas/GetPlayerByPlatformId.ts) -> z.infer<typeof GetPlayerSchema>
  - GetPlayerByPlatformIdResponse (common/src/service-connectors/core/schemas/GetPlayerByPlatformId.ts) -> z.infer<typeof GetPlayerByPlatformId_Response>
  - GetPlayerSuccessResponse (common/src/service-connectors/core/schemas/GetPlayerByPlatformId.ts) -> z.infer<typeof GetPlayerSuccessResponseSchema>
  - GetTransactionsDiscordWebhookRequest (common/src/service-connectors/core/schemas/GetTransactionsDiscordWebhook.schema.ts) -> z.infer< typeof GetTransactionsDiscordWebhook_Request >
  - GetTransactionsDiscordWebhookResponse (common/src/service-connectors/core/schemas/GetTransactionsDiscordWebhook.schema.ts) -> z.infer< typeof GetTransactionsDiscordWebhook_Response >
  - GetUserByAuthAccountResponse (common/src/service-connectors/core/schemas/GetUserByAuthAccount.schema.ts) -> z.infer<typeof GetUserByAuthAccount_Response>
  - GetUsersLastScrimResponse (common/src/service-connectors/core/schemas/GetUsersLastScrim.schema.ts) -> z.infer<typeof GetUsersLastScrim_Response>
  - MemberRestriction (common/src/service-connectors/core/schemas/MemberRestriction.schema.ts) -> z.infer<typeof MemberRestrictionSchema>
  - Franchise (common/src/service-connectors/core/types/Franchise.schema.ts) -> z.infer<typeof FranchiseSchema>
  - FranchiseProfile (common/src/service-connectors/core/types/Franchise.schema.ts) -> z.infer<typeof FranchiseProfileSchema>
  - Member (common/src/service-connectors/core/types/Member.schema.ts) -> z.infer<typeof MemberSchema>
  - MemberProfile (common/src/service-connectors/core/types/Member.schema.ts) -> z.infer<typeof MemberProfileSchema>
  - Organization (common/src/service-connectors/core/types/Organization.schema.ts) -> z.infer<typeof OrganizationSchema>
  - OrganizationProfile (common/src/service-connectors/core/types/Organization.schema.ts) -> z.infer<typeof OrganizationProfileSchema>
  - SkillGroup (common/src/service-connectors/core/types/SkillGroup.schema.ts) -> z.infer<typeof SkillGroupSchema>
  - SkillGroupProfile (common/src/service-connectors/core/types/SkillGroup.schema.ts) -> z.infer<typeof SkillGroupProfileSchema>
  - User (common/src/service-connectors/core/types/User.schema.ts) -> z.infer<typeof UserSchema>
  - UserProfile (common/src/service-connectors/core/types/User.schema.ts) -> z.infer<typeof UserProfileSchema>
  - ImageGenerationInput (common/src/service-connectors/image-generation/image-generation.types.ts) -> z.infer< typeof ImageGenerationSchemas[T]["input"] >
  - ImageGenerationOutput (common/src/service-connectors/image-generation/image-generation.types.ts) -> z.infer< typeof ImageGenerationSchemas[T]["output"] >
  - ImageGenerationResponse (common/src/service-connectors/image-generation/image-generation.types.ts) -> | ImageGenerationSuccessResponse<T> | ImageGenerationErrorResponse
  - DataLeaf (common/src/service-connectors/image-generation/schemas/GenerateImage.schema.ts) -> z.infer<typeof dataLeafSchema>
  - Template (common/src/service-connectors/image-generation/schemas/GenerateImage.schema.ts) -> DataLeaf | { [key: string]: Template;} | Template[]
  - TemplateStructure (common/src/service-connectors/image-generation/schemas/GenerateImage.schema.ts) -> z.infer<typeof templateStructureSchema>
  - MatchmakingInput (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> z.infer< typeof MatchmakingSchemas[T]["input"] >
  - MatchmakingOutput (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> z.infer< typeof MatchmakingSchemas[T]["output"] >
  - MatchmakingResponse (common/src/service-connectors/matchmaking/matchmaking.types.ts) -> | MatchmakingSuccessResponse<T> | MatchmakingErrorResponse
  - CreateLFSScrimRequest (common/src/service-connectors/matchmaking/schemas/scrim/CreateLFSScrim.schema.ts) -> z.infer<typeof CreateLFSScrim_Request>
  - CreateScrimOptions (common/src/service-connectors/matchmaking/schemas/scrim/CreateScrim.schema.ts) -> z.infer<typeof CreateScrim_Request>
  - JoinScrimOptions (common/src/service-connectors/matchmaking/schemas/scrim/JoinScrim.schema.ts) -> z.infer<typeof JoinScrim_Request>
  - UpdateLFSScrimPlayersRequest (common/src/service-connectors/matchmaking/schemas/scrim/UpdateLFSScrimPlayers.schema.ts) -> z.infer<typeof UpdateLFSScrimPlayers_Request>
  - UpdateLFSScrimPlayersResponse (common/src/service-connectors/matchmaking/schemas/scrim/UpdateLFSScrimPlayers.schema.ts) -> z.infer<typeof UpdateLFSScrimPlayers_Response>
  - Scrim (common/src/service-connectors/matchmaking/types/Scrim.ts) -> z.infer<typeof ScrimSchema>
  - ScrimGame (common/src/service-connectors/matchmaking/types/ScrimGame.ts) -> z.infer<typeof ScrimGameSchema>
  - ScrimJoinOptions (common/src/service-connectors/matchmaking/types/ScrimJoinOptions.ts) -> z.infer<typeof ScrimJoinOptionsSchema>
  - ScrimLobby (common/src/service-connectors/matchmaking/types/ScrimLobby.ts) -> z.infer<typeof ScrimLobbySchema>
  - ScrimMetrics (common/src/service-connectors/matchmaking/types/ScrimMetrics.ts) -> z.infer<typeof ScrimMetricsSchema>
  - ScrimPlayer (common/src/service-connectors/matchmaking/types/ScrimPlayer.ts) -> z.infer<typeof ScrimPlayerSchema>
  - ScrimSettings (common/src/service-connectors/matchmaking/types/ScrimSettings.ts) -> z.infer<typeof ScrimSettingsSchema>
  - ScrimTeam (common/src/service-connectors/matchmaking/types/ScrimTeam.ts) -> z.infer<typeof ScrimTeamSchema>
  - NotificationInput (common/src/service-connectors/notification/notification.types.ts) -> z.infer< typeof NotificationSchemas[T]["input"] >
  - NotificationOutput (common/src/service-connectors/notification/notification.types.ts) -> z.infer< typeof NotificationSchemas[T]["output"] >
  - NotificationResponse (common/src/service-connectors/notification/notification.types.ts) -> | NotificationSuccessResponse<T> | NotificationErrorResponse
  - RankdownNotification (common/src/service-connectors/notification/schemas/SendNotification/RankdownNotification.schema.ts) -> z.infer<typeof RankdownNotificationSchema>
  - RankdownNotificationPayload (common/src/service-connectors/notification/schemas/SendNotification/RankdownNotification.schema.ts) -> RankdownNotification["payload"]
  - ICanSubmitReplays_Response (common/src/service-connectors/submission/schemas/CanSubmitReplays.schema.ts) -> z.infer<typeof CanSubmitReplays_Response>
  - GetAllSubmissionsResponse (common/src/service-connectors/submission/schemas/GetAllSubmissions.schema.ts) -> z.infer<typeof GetAllSubmissions_Response>
  - GetSubmissionIfExistsResponse (common/src/service-connectors/submission/schemas/GetSubmissionIfExists.schema.ts) -> z.infer<typeof GetSubmissionIfExists_Response>
  - MockCompletion_Request (common/src/service-connectors/submission/schemas/MockCompletion.schema.ts) -> z.infer<typeof MockCompletion_Request>
  - MockCompletion_Response (common/src/service-connectors/submission/schemas/MockCompletion.schema.ts) -> z.infer<typeof MockCompletion_Response>
  - CanRatifySubmissionResponse (common/src/service-connectors/submission/schemas/ratification/CanRatifySubmission.schema.ts) -> z.infer<typeof CanRatifySubmission_Response>
  - FranchiseValidationErrorCode (common/src/service-connectors/submission/schemas/ValidateSubmission.schema.ts) -> typeof FRANCHISE_VALIDATION_ERRORS[keyof typeof FRANCHISE_VALIDATION_ERRORS]
  - SubmissionInput (common/src/service-connectors/submission/submission.types.ts) -> z.infer< typeof SubmissionSchemas[T]["input"] >
  - SubmissionOutput (common/src/service-connectors/submission/submission.types.ts) -> z.infer< typeof SubmissionSchemas[T]["output"] >
  - SubmissionResponse (common/src/service-connectors/submission/submission.types.ts) -> | SubmissionSuccessResponse<T> | SubmissionErrorResponse
  - CompatibleReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> EnhancedReplaySubmission | ReplaySubmission
  - EnhancedReplaySubmission (common/src/service-connectors/submission/types/enhanced-replay-submission.ts) -> | EnhancedScrimReplaySubmission | EnhancedMatchReplaySubmission | EnhancedLFSReplaySubmission
  - RejectedItem (common/src/service-connectors/submission/types/replay-submission-rejection.ts) -> Omit<ReplaySubmissionItem, "progress">
  - ReplaySubmissionTeamResult (common/src/service-connectors/submission/types/replay-submission-stats.ts) -> "WIN" | "LOSS" | "DRAW" | "UNKNOWN"
  - ReplaySubmission (common/src/service-connectors/submission/types/replay-submission.ts) -> ScrimReplaySubmission | MatchReplaySubmission | LFSReplaySubmission

#### Context: util

- classes:
  - ConfigResolver (common/src/util/config-resolver.ts)
    - public properties: none
    - public methods: getSecret(envKey: string, filePath: string, configKey?: string): string, getConfig(envKey: string, configKey: string, defaultValue?: T): T, getBooleanConfig(envKey: string, configKey: string, defaultValue: any): boolean, getNumberConfig(envKey: string, configKey: string, defaultValue?: number): number
  - Precondition (common/src/util/Precondition.ts)
    - public properties: resolve: Resolve, promise: Promise<void>
    - public methods: none
- interfaces:
  - CacheOptions (common/src/util/caching/Cache.decorator.ts) -> ttl: number, transformers?: Record<string, (a: any) => string>, verbose?: boolean

## Workspace: clients/web

- Files parsed: 36
- Exported entities: 92
- Module classes: 0
- Runtime classes: 0
- Data/interface entities: 92

### Module Definitions

- None

### Runtime Classes (Public Methods)

- None

### Data Contracts and Interfaces

#### Context: lib

- classes:
  - BaseStore (clients/web/src/lib/api/core/BaseStore.ts)
    - public properties: none
    - public methods: subscribe(sub: (T) => unknown): () => void
  - LiveQueryStore (clients/web/src/lib/api/core/LiveQueryStore.ts)
    - public properties: none
    - public methods: subscriptionVariables(): SV, subscriptionVariables(v: SV), subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void, invalidate(): void
  - QueryStore (clients/web/src/lib/api/core/QueryStore.ts)
    - public properties: none
    - public methods: vars(newVars: V), subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void, set(v: V): void, invalidate(): void
  - SubscriptionStore (clients/web/src/lib/api/core/SubscriptionStore.ts)
    - public properties: none
    - public methods: vars(): V, vars(v: V), subscribe(sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown): () => void, invalidate(): void
  - CurrentUserStore (clients/web/src/lib/api/queries/CurrentUser.store.ts)
    - public properties: none
    - public methods: none
  - GameFeatureStore (clients/web/src/lib/api/queries/game-features/GameFeature.store.ts)
    - public properties: none
    - public methods: none
  - GamesAndModesStore (clients/web/src/lib/api/queries/GamesAndModes.store.ts)
    - public properties: none
    - public methods: none
  - LeagueFixtureStore (clients/web/src/lib/api/queries/league/LeagueFixture.store.ts)
    - public properties: none
    - public methods: none
  - LeagueScheduleStore (clients/web/src/lib/api/queries/league/LeagueSchedule.store.ts)
    - public properties: none
    - public methods: none
  - MatchStore (clients/web/src/lib/api/queries/match/Match.store.ts)
    - public properties: none
    - public methods: none
  - RestrictedPlayersStore (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts)
    - public properties: none
    - public methods: none
  - ActiveScrimsStore (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts)
    - public properties: none
    - public methods: none
  - LFSScrimsStore (clients/web/src/lib/api/queries/scrims/LFSScrims.store.ts)
    - public properties: none
    - public methods: none
  - ActiveSubmissionsStore (clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts)
    - public properties: none
    - public methods: none
  - SubmissionStore (clients/web/src/lib/api/queries/submissions/Submission.store.ts)
    - public properties: none
    - public methods: none
  - SubmissionStatsStore (clients/web/src/lib/api/queries/submissions/SubmissionStats.store.ts)
    - public properties: none
    - public methods: none
  - FollowReplayParseStore (clients/web/src/lib/api/subscriptions/FollowReplayParse.subscription.ts)
    - public properties: none
    - public methods: none
- interfaces:
  - ReportMemberPlatformAccountResponse (clients/web/src/lib/api/mutations/ReportMemberPlatformAccount.mutation.ts) -> reportMemberPlatformAccount: string
  - ReportMemberPlatformAccountVariables (clients/web/src/lib/api/mutations/ReportMemberPlatformAccount.mutation.ts) -> userId: number, organizationId: number, tracker: string, platform: string, platformId: string
  - UploadReplaysResponse (clients/web/src/lib/api/mutations/UploadReplays.mutation.ts) -> parseReplays: string[]
  - UploadReplaysVariables (clients/web/src/lib/api/mutations/UploadReplays.mutation.ts) -> files: FileUpload[], submissionId: string
  - CurrentUserResult (clients/web/src/lib/api/queries/CurrentUser.store.ts) -> me: { id: number; members: Array<{ id: number; players: { skillGroup: { game: { title: string; }; }; franchisePositions: string[]; franchiseName: string; }; }>; }
  - CurrentUserVars (clients/web/src/lib/api/queries/CurrentUser.store.ts) -> orgId?: number
  - GameFeatureResult (clients/web/src/lib/api/queries/game-features/GameFeature.store.ts) -> getFeatureEnabled: boolean
  - GameFeatureVariables (clients/web/src/lib/api/queries/game-features/GameFeature.store.ts) -> code: FeatureCode, gameId: number
  - GamesAndModesValue (clients/web/src/lib/api/queries/GamesAndModes.store.ts) -> games: Array<{ id: number; title: string; modes: Array<{ id: number; teamSize: number; teamCount: number; description: string; }>; }>
  - Fixture (clients/web/src/lib/api/queries/league/LeagueFixture.store.ts) -> id: number, homeFranchise: FixtureFranchise, awayFranchise: FixtureFranchise, scheduleGroup: {description: string;}, matches: Array<{ id: number; skillGroup: { ordinal: number; profile: { description: string; }; }; submissionId: string; gameMode: {description: string;}; submissionStatus: "submitting" | "ratifying" | "completed"; canSubmit: boolean; canRatify: boolean; }>
  - FixtureFranchise (clients/web/src/lib/api/queries/league/LeagueFixture.store.ts) -> profile: { title: string; primaryColor: string; secondaryColor: string; photo: {url: string;}; }
  - LeagueFixtureValue (clients/web/src/lib/api/queries/league/LeagueFixture.store.ts) -> fixture: Fixture
  - LeagueFixtureVars (clients/web/src/lib/api/queries/league/LeagueFixture.store.ts) -> id: number
  - LeagueScheduleValue (clients/web/src/lib/api/queries/league/LeagueSchedule.store.ts) -> seasons: LeagueScheduleSeason[]
  - LeagueScheduleVars (clients/web/src/lib/api/queries/league/LeagueSchedule.store.ts) -> none
  - LeagueScheduleFixture (clients/web/src/lib/api/queries/league/LeagueSchedule.types.ts) -> id: number, homeFranchise: { profile: LeagueScheduleFranchise; }, awayFranchise: { profile: LeagueScheduleFranchise; }
  - LeagueScheduleFranchise (clients/web/src/lib/api/queries/league/LeagueSchedule.types.ts) -> title: string, primaryColor: string, secondaryColor: string, photo: { url: string; }
  - LeagueScheduleSeason (clients/web/src/lib/api/queries/league/LeagueSchedule.types.ts) -> id: number, description: string, game: { id: number; title: string; }, type: { name: string; }, childGroups: LeagueScheduleWeek[]
  - LeagueScheduleWeek (clients/web/src/lib/api/queries/league/LeagueSchedule.types.ts) -> id: number, start: string, description: string, fixtures: LeagueScheduleFixture[]
  - Match (clients/web/src/lib/api/queries/match/Match.store.ts) -> id: number, rounds: Array<{ id: number; }>, skillGroup: { profile: { description: string; }; }, gameMode: { description: string; }, matchParent: { fixture: { scheduleGroup: { description: string; }; homeFranchise: { profile: { title: string; }; }; awayFranchise: { profile: { title: string; }; }; }; }
  - MatchResult (clients/web/src/lib/api/queries/match/Match.store.ts) -> getMatchBySubmissionId: Match
  - MatchVars (clients/web/src/lib/api/queries/match/Match.store.ts) -> submissionId: string
  - MemberRestriction (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> id: number, type: MemberRestrictionType, expiration: Date, reason: string, member: Member, manualExpiration?: Date, manualExpirationReason?: string, memberId: number
  - MemberRestrictionEvent (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> eventType: MemberRestrictionEventType
  - RestrictedPlayersStoreSubscriptionVariables (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> none
  - RestrictedPlayersStoreValue (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> getActiveMemberRestrictions: MemberRestriction[]
  - RestrictedPlayersStoreVariables (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> none
  - RestrictedPlayersSubscriptionValue (clients/web/src/lib/api/queries/RestrictedPlayers.store.ts) -> followRestrictedMembers: MemberRestrictionEvent
  - Player (clients/web/src/lib/api/queries/scrims/ActiveScrimPlayers.store.ts) -> id: number, name: string, checkedIn: boolean, orgId: number
  - ActiveScrimsStoreSubscriptionVariables (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts) -> none
  - ActiveScrimsStoreValue (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts) -> activeScrims: ActiveScrims
  - ActiveScrimsStoreVariables (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts) -> none
  - ActiveScrimsSubscriptionValue (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts) -> activeScrims: { scrim: ActiveScrims[number]; event: EventTopic; }
  - CurrentScrim (clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts) -> id: string, playerCount: number, maxPlayers: number, status: string, createdAt: Date, skillGroup: { profile: { description: string; }; }, currentGroup?: { code: string; players: string[]; }, gameMode: { description: string; game: { title: string; }; }, settings: { competitive: boolean; mode: string; lfs: boolean; }, players: Array<{ id: number; name: string; checkedIn: boolean; }>, playersAdmin: Array<{ id: number; name: string; }>, lobby: { name: string; password: string; }, games: Array<{ teams: Array<{ players: Array<{ id: number; name: string; }>; }>; }>, submissionId?: string
  - CurrentScrimStoreSubscriptionVariables (clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts) -> none
  - CurrentScrimStoreValue (clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts) -> currentScrim: CurrentScrim
  - CurrentScrimStoreVariables (clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts) -> none
  - CurrentScrimSubscriptionValue (clients/web/src/lib/api/queries/scrims/CurrentScrim.store.ts) -> currentScrim: { scrim: CurrentScrim; }
  - PendingScrim (clients/web/src/lib/api/queries/scrims/PendingScrims.store.ts) -> id: string, playerCount: number, maxPlayers: number, status: "PENDING" | "EMPTY" | "POPPED", createdAt: Date, gameMode: { description: string; game: { title: string; }; }, settings: { competitive: boolean; mode: "TEAMS" | "ROUND_ROBIN"; lfs: boolean; }, skillGroup: { profile: { description: string; }; }
  - MetricsResult (clients/web/src/lib/api/queries/scrims/ScrimMetrics.store.ts) -> metrics: { pendingScrims: number; playersQueued: number; playersScrimming: number; totalScrims: number; totalPlayers: number; completedScrims: number; previousCompletedScrims: number; }
  - ActiveSubmissionsStoreValue (clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts) -> activeSubmissions: Submission[]
  - ActiveSubmissionsStoreVariables (clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts) -> none
  - ActiveSubmissionsSubscriptionValue (clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts) -> activeSubmissions: { submission: Submission; event: EventTopic; }
  - ActiveSubmissionsSubscriptionVariables (clients/web/src/lib/api/queries/submissions/ActiveSubmissions.store.ts) -> none
  - SubmissionStoreSubscriptionVariables (clients/web/src/lib/api/queries/submissions/Submission.store.ts) -> submissionId: string
  - SubmissionStoreValue (clients/web/src/lib/api/queries/submissions/Submission.store.ts) -> submission: Submission
  - SubmissionStoreVariables (clients/web/src/lib/api/queries/submissions/Submission.store.ts) -> submissionId: string
  - SubmissionSubscriptionValue (clients/web/src/lib/api/queries/submissions/Submission.store.ts) -> submission: Submission
  - RatifierInfo (clients/web/src/lib/api/queries/submissions/submission.types.ts) -> playerId: number, franchiseId: number, franchiseName: string, ratifiedAt: string
  - Submission (clients/web/src/lib/api/queries/submissions/submission.types.ts) -> id: string, status: string, creatorId: number, ratifications: number, requiredRatifications: number, ratifiers: RatifierInfo[], userHasRatified: boolean, type: "MATCH" | "SCRIM", scrimId?: string, matchId?: number, stale: boolean, items: Array<{ taskId: string; originalFilename: string; progress: SubmissionProgress; }>, rejections: SubmissionRejection[], validated: boolean, stats: { games: Array<{ teams: Array<{ result?: "WIN" | "LOSS" | "DRAW" | "UNKNOWN"; score?: number; stats?: Record<string, number>; players: Array<{ name: string; stats?: Record<string, number>; }>; }>; }>; }
  - SubmissionProgress (clients/web/src/lib/api/queries/submissions/submission.types.ts) -> progress: { value: number; message: string; }, status: "Pending" | "Error" | "Complete", taskId: string, error?: string
  - SubmissionRejection (clients/web/src/lib/api/queries/submissions/submission.types.ts) -> playerId: string, playerName: string, reason: string, stale: boolean
  - SubmissionStatsData (clients/web/src/lib/api/queries/submissions/SubmissionStats.store.ts) -> games: Array<{ teams: Array<{ result?: "WIN" | "LOSS" | "DRAW" | "UNKNOWN"; score?: number; stats?: Record<string, number>; players: Array<{ name: string; stats?: Record<string, number>; }>; }>; }>
  - FollowReplayParseProgressMessage (clients/web/src/lib/api/subscriptions/FollowReplayParse.subscription.ts) -> followReplayParse: ProgressMessage<unknown>
  - FollowReplayParseProgressVariables (clients/web/src/lib/api/subscriptions/FollowReplayParse.subscription.ts) -> submissionId: string
  - ChatwootCustomAttributes (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> userId: number
  - ChatwootGlobal (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> baseUrl: string, hasLoaded: boolean, hideMessageBubble: boolean, isOpen: boolean, position: "left" | "right", websiteToken: string, locale: string, type: unknown, launcherTitle: string, showPopoutButon: boolean, widgetStyle: unknown, resetTriggered: boolean, darkMode: boolean, toggle: (state: unknown) => void, toggleBubbleVisibility: (visibility: unknown) => void, popoutChatWindow: () => void, setUser: (identifier: string, user: ChatwootUser) => void, setCustomAttributes: (customAttributes: Partial<ChatwootCustomAttributes>) => void, deleteCustomAttribute: (customAttribute: keyof ChatwootCustomAttributes) => void, setLabel: (label: ChatwootConversationLabel) => void, removeLabel: (label: ChatwootConversationLabel) => void, setLocale: (localeToBeUsed: string) => void, reset: () => void
  - ChatwootSDK (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> run: ({websiteToken, baseUrl}: {websiteToken: string; baseUrl: string;}) => void
  - ChatwootSettings (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> showPopoutButton: boolean, hideMessageBubble: boolean, position: "left" | "right", locale: string, type: "standard" | "expanded_bubble", darkMode: "light" | "auto"
  - ChatwootUser (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> name?: string, avatar_url?: string, email?: string, identifier_hash?: string, phone_number?: string, description?: string, country_code?: string, city?: string, company_name?: string, social_profiles?: { twitter?: string; linkedin?: string; facebook?: string; github?: string; }
  - Toast (clients/web/src/lib/components/molecules/toasts/ToastStore.ts) -> content: string, status: "info" | "error", id?: string
  - NavigationItem (clients/web/src/lib/stores/navigation.store.ts) -> label: string, target: string
  - Config (clients/web/src/lib/utils/types/Config.ts) -> client: { gqlUrl: string; secure: boolean; chatwoot: { enabled: boolean; url: string; websiteToken: string; }; stack: Stack; }, server: { chatwoot: { hmacKey: string; }; stack: Stack; }
  - Progress (clients/web/src/lib/utils/types/progress.types.ts) -> value: number, message: string
  - ProgressMessage (clients/web/src/lib/utils/types/progress.types.ts) -> taskId: string, status: ProgressStatus, progress: Progress, result: TaskResult | null, error: string | null
  - SessionUser (clients/web/src/lib/utils/types/SessionUser.ts) -> userId: number, username: string, currentOrganizationId: number, orgTeams: number[]
- enums:
  - FeatureCode (clients/web/src/lib/api/queries/game-features/feature.types.ts) -> AUTO_SALARIES, AUTO_RANKOUTS
  - ProgressStatus (clients/web/src/lib/utils/types/progress.types.ts) -> Pending, Complete, Error
- type aliases:
  - ActiveScrims (clients/web/src/lib/api/queries/scrims/ActiveScrims.store.ts) -> Array<CurrentScrim & {organizationId: number;}>
  - ChatwootConversationLabel (clients/web/src/lib/components/abstract/Chatwoot/Chatwoot.types.ts) -> "org-mle"
  - Stack (clients/web/src/lib/utils/types/Config.ts) -> "local" | "dev" | "staging" | "main"

## Workspace: microservices/submission-service

- Files parsed: 18
- Exported entities: 21
- Module classes: 3
- Runtime classes: 13
- Data/interface entities: 5

### Module Definitions

- **AppModule** (microservices/submission-service/src/app.module.ts)
  - imports: EventsModule, RedisModule, ReplaySubmissionModule, ReplayValidationModule
  - providers: none
  - controllers: none
  - exports: none
- **ReplaySubmissionModule** (microservices/submission-service/src/replay-submission/replay-submission.module.ts)
  - imports: RedisModule, MatchmakingModule, EventsModule, MinioModule, CeleryModule, forwardRef(...), CoreModule
  - providers: ReplaySubmissionService, ReplaySubmissionCrudService, ReplaySubmissionUtilService, ReplayParseSubscriber, ReplaySubmissionRatificationService, CrossFranchiseValidationService, StatsConverterService, SubmissionMigrationService
  - controllers: ReplayUploadController, ReplaySubmissionRatificationController, ReplaySubmissionCrudController
  - exports: ReplaySubmissionCrudService
- **ReplayValidationModule** (microservices/submission-service/src/replay-validation/replay-validation.module.ts)
  - imports: CoreModule, EventsModule, MatchmakingModule, MinioModule, forwardRef(...)
  - providers: ReplayValidationService
  - controllers: ReplayValidationController
  - exports: ReplayValidationService

### Runtime Classes (Public Methods)

#### Context: replay-submission

- **CrossFranchiseValidationService** (service; microservices/submission-service/src/replay-submission/cross-franchise-validation.service.ts)
  - decorators: Injectable
  - dependencies: coreService: CoreService
  - public methods: validateRatification(submission: EnhancedReplaySubmission, playerId: number): Promise<CrossFranchiseValidationError | null>
- **ReplayParseSubscriber** (service; microservices/submission-service/src/replay-submission/parse-subscriber/replay-parse.subscriber.ts)
  - decorators: Injectable
  - dependencies: celeryService: CeleryService, submissionService: ReplaySubmissionService, submissionCrudService: ReplaySubmissionCrudService, eventsService: EventsService
  - public methods: subscribe(submissionId: string): void
- **ReplaySubmissionCrudController** (controller; microservices/submission-service/src/replay-submission/replay-submission-crud/replay-submission-crud.controller.ts)
  - decorators: Controller
  - dependencies: crudService: ReplaySubmissionCrudService, migrationService: SubmissionMigrationService
  - public methods: migrateSubmissions(): Promise<{success: boolean;}> [MessagePattern], getSubmissionIfExists(payload: unknown): Promise<GetSubmissionIfExistsResponse> [MessagePattern], getAllSubmissions(payload: unknown): Promise<GetAllSubmissionsResponse> [MessagePattern], removeSubmission(payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.RemoveSubmission>> [MessagePattern], getSubmissionRejections(payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.GetSubmissionRejections>> [MessagePattern]
- **ReplaySubmissionCrudService** (service; microservices/submission-service/src/replay-submission/replay-submission-crud/replay-submission-crud.service.ts)
  - decorators: Injectable
  - dependencies: redisService: RedisService, matchmakingService: MatchmakingService, coreService: CoreService
  - public methods: getAllSubmissions(): Promise<ReplaySubmission[]>, getSubmission(submissionId: string): Promise<ReplaySubmission | undefined>, getOrgRequiredRatifications(organizationId: number): Promise<number>, getOrCreateSubmission(submissionId: string, playerId: number): Promise<ReplaySubmission>, getSubmissionItems(submissionId: string): Promise<ReplaySubmissionItem[]>, getSubmissionRejections(submissionId: string): Promise<ReplaySubmissionRejection[]>, getSubmissionRatifiers(submissionId: string): Promise<number[] | RatifierInfo[]>, removeSubmission(submissionId: string): Promise<void>, removeItems(submissionId: string): Promise<void>, updateStatus(submissionId: string, submissionStatus: ReplaySubmissionStatus): Promise<void>, upsertItem(submissionId: string, item: ReplaySubmissionItem): Promise<void>, updateItemProgress(submissionId: string, progress: ProgressMessage<Task.ParseReplay>): Promise<void>, setValidatedTrue(submissionId: string): Promise<void>, setStats(submissionId: string, stats: ReplaySubmissionStats): Promise<void>, addRatifier(submissionId: string, userId: number): Promise<void>, clearRatifiers(submissionId: string): Promise<void>, expireRejections(submissionId: string): Promise<void>, addRejection(submissionId: string, playerId: number, reason: string): Promise<void>
- **ReplaySubmissionRatificationController** (controller; microservices/submission-service/src/replay-submission/replay-submission-ratification/replay-submission-ratification.controller.ts)
  - decorators: Controller
  - dependencies: ratificationService: ReplaySubmissionRatificationService
  - public methods: resetSubmission(payload: unknown): Promise<true> [MessagePattern], ratifySubmission(payload: unknown): Promise<true> [MessagePattern], rejectSubmission(payload: unknown): Promise<true> [MessagePattern]
- **ReplaySubmissionRatificationService** (service; microservices/submission-service/src/replay-submission/replay-submission-ratification/replay-submission-ratification.service.ts)
  - decorators: Injectable
  - dependencies: eventService: EventsService, crudService: ReplaySubmissionCrudService, matchmakingService: MatchmakingService, validationService: CrossFranchiseValidationService
  - public methods: resetSubmission(submissionId: string, override: boolean, playerId: string): Promise<void>, ratifyScrim(userId: number, submissionId: string): Promise<Boolean>, rejectSubmission(playerId: number, submissionId: string, reasons: string[]): Promise<Boolean>
- **ReplaySubmissionUtilService** (service; microservices/submission-service/src/replay-submission/replay-submission-util.service.ts)
  - decorators: Injectable
  - dependencies: submissionCrudService: ReplaySubmissionCrudService, redisService: RedisService, matchmakingService: MatchmakingService, coreService: CoreService
  - public methods: isRatified(submissionId: string): Promise<boolean>, canSubmitReplays(submissionId: string, memberId: number, userId: number, override?: boolean): Promise<ICanSubmitReplays_Response>, canRatifySubmission(submissionId: string, memberId: number, userId: number): Promise<CanRatifySubmissionResponse>
- **ReplaySubmissionService** (service; microservices/submission-service/src/replay-submission/replay-submission.service.ts)
  - decorators: Injectable
  - dependencies: submissionCrudService: ReplaySubmissionCrudService, celeryService: CeleryService, eventsService: EventsService, replayParseSubscriber: ReplayParseSubscriber, replayValidationService: ReplayValidationService, ratificationService: ReplaySubmissionRatificationService, statsConverterService: StatsConverterService
  - public methods: beginSubmission(filePaths: Array<{minioPath: string; originalFilename: string;}>, submissionId: string, creatorId: number): Promise<string[]>, mockCompletion(submissionId: string, results: unknown[]): Promise<boolean>, completeSubmission(submission: ReplaySubmission, submissionId: string): Promise<void>
- **ReplayUploadController** (controller; microservices/submission-service/src/replay-submission/replay-upload.controller.ts)
  - decorators: Controller
  - dependencies: replaySubmissionUtilService: ReplaySubmissionUtilService, replaySubmissionService: ReplaySubmissionService
  - public methods: canSubmitReplays(payload: unknown): Promise<ICanSubmitReplays_Response> [MessagePattern], canRatifySubmission(payload: unknown): Promise<CanRatifySubmissionResponse> [MessagePattern], submitReplays(payload: unknown): Promise<string[]> [MessagePattern], mockCompletion(payload: unknown): Promise<boolean> [MessagePattern], getSubmissionRedisKey(payload: unknown): SubmissionOutput<SubmissionEndpoint.GetSubmissionRedisKey> [MessagePattern]
- **StatsConverterService** (service; microservices/submission-service/src/replay-submission/stats-converter/stats-converter.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: convertStats(rawStats: ParsedReplay[]): ReplaySubmissionStats
- **SubmissionMigrationService** (service; microservices/submission-service/src/replay-submission/submission-migration.service.ts)
  - decorators: Injectable
  - dependencies: redisService: RedisService, coreService: CoreService, matchmakingService: MatchmakingService
  - public methods: migrateSubmissions(): Promise<void>

#### Context: replay-validation

- **ReplayValidationController** (controller; microservices/submission-service/src/replay-validation/replay-validation.controller.ts)
  - decorators: Controller
  - dependencies: replayValidationService: ReplayValidationService, replaySubmissionCrudService: ReplaySubmissionCrudService
  - public methods: validateSubmission(payload: unknown): Promise<ValidationResult> [MessagePattern]
- **ReplayValidationService** (service; microservices/submission-service/src/replay-validation/replay-validation.service.ts)
  - decorators: Injectable
  - dependencies: coreService: CoreService, matchmakingService: MatchmakingService, minioService: MinioService, eventsService: EventsService
  - public methods: validate(submission: ReplaySubmission): Promise<ValidationResult>

### Data Contracts and Interfaces

#### Context: replay-validation

- interfaces:
  - ValidationError (microservices/submission-service/src/replay-validation/types/validation-result.ts) -> error: string, gameIndex?: number, teamIndex?: number, playerIndex?: number
  - ValidationFailure (microservices/submission-service/src/replay-validation/types/validation-result.ts) -> valid: false, errors: ValidationError[]
  - ValidationSuccess (microservices/submission-service/src/replay-validation/types/validation-result.ts) -> valid: true
- type aliases:
  - UserWithPlatformId (microservices/submission-service/src/replay-validation/types/user-with-platform-id.ts) -> GetUserByAuthAccountResponse & { platform: string; platformId: string; }
  - ValidationResult (microservices/submission-service/src/replay-validation/types/validation-result.ts) -> ValidationFailure | ValidationSuccess

## Workspace: microservices/matchmaking-service

- Files parsed: 14
- Exported entities: 16
- Module classes: 2
- Runtime classes: 9
- Data/interface entities: 5

### Module Definitions

- **AppModule** (microservices/matchmaking-service/src/app.module.ts)
  - imports: EventsModule, ScrimModule, RedisModule
  - providers: none
  - controllers: none
  - exports: none
- **ScrimModule** (microservices/matchmaking-service/src/scrim/scrim.module.ts)
  - imports: RedisModule, EventsModule, AnalyticsModule, SubmissionModule, BullModule.forRoot(...), BullModule.registerQueue(...), BullModule.registerQueue(...)
  - providers: ScrimConsumer, ScrimCrudService, ScrimService, ScrimLogicService, EventProxyService, ScrimMetricsService, ScrimGroupService, GameOrderService, ScrimEventSubscriber
  - controllers: ScrimController
  - exports: ScrimCrudService, EventProxyService, ScrimLogicService, ScrimGroupService

### Runtime Classes (Public Methods)

#### Context: scrim

- **EventProxyService** (service; microservices/matchmaking-service/src/scrim/event-proxy/event-proxy.service.ts)
  - decorators: Injectable
  - dependencies: service: EventsService, scrimMetricsService: ScrimMetricsService
  - public methods: publish(topic: T, payload: EventPayload<T>, subtopic?: string): Promise<boolean>, subscribe(topic: T, instanceExclusive: boolean, subtopic?: string): Promise<Observable<EventResponse<T>>>
- **GameOrderService** (service; microservices/matchmaking-service/src/scrim/game-order/game-order.service.ts)
  - decorators: Injectable
  - dependencies: scrimGroupService: ScrimGroupService
  - public methods: collectPartitions(partition: number[][], teamSize: number, final: number[][][]): void, Partition(set: number[], index: number, ans: number[][], final: number[][][], teamSize: number): void, allPartitions(set: number[], output: number[][][], teamSize: number): void, generateGameOrder(scrim: Scrim): ScrimGame[]
- **ScrimCrudService** (service; microservices/matchmaking-service/src/scrim/scrim-crud/scrim-crud.service.ts)
  - decorators: Injectable
  - dependencies: redisService: RedisService
  - public methods: createScrim({ authorId, organizationId, gameModeId, skillGroupId, settings, player, }: Omit<CreateScrimOptions, "join"> & { player?: ScrimPlayer; }): Promise<Scrim>, createLFSScrim(authorId: number, organizationId: number, gameModeId: number, skillGroupId: number, settings: ScrimSettings, players: ScrimPlayer[], teams: ScrimPlayer[][], numRounds: number): Promise<Scrim>, updateLFSScrim(scrim: Scrim): Promise<void>, removeScrim(id: string): Promise<void>, getScrim(id: string): Promise<Scrim | null>, getAllScrims(skillGroupId?: number): Promise<Scrim[]>, getScrimByPlayer(id: number): Promise<Scrim | null>, getScrimBySubmissionId(submissionId: string): Promise<Scrim | null>, addPlayerToScrim(scrimId: string, player: ScrimPlayer): Promise<void>, removePlayerFromScrim(scrimId: string, playerId: number): Promise<void>, updatePlayer(scrimId: string, player: ScrimPlayer): Promise<void>, playerInAnyScrim(playerId: number): Promise<boolean>, updateScrimUpdatedAt(scrimId: string): Promise<void>, updateScrimStatus(scrimId: string, status: ScrimStatus): Promise<void>, updateScrimUnlockedStatus(scrimId: string, status: ScrimStatus): Promise<void>, setSubmissionId(scrimId: string, submissionId: string): Promise<void>, setTimeoutJobId(scrimId: string, jobId: JobId): Promise<void>, generateLobby(scrimId: string): Promise<void>, setScrimGames(scrimId: string, games: ScrimGame[]): Promise<void>
- **ScrimGroupService** (service; microservices/matchmaking-service/src/scrim/scrim-group/scrim-group.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: getScrimGroups(scrim: Scrim): Record<string, ScrimPlayer[]>, getUngroupedPlayers(scrim: Scrim): ScrimPlayer[], modeAllowsGroups(mode: ScrimMode): boolean, canCreateNewGroup(scrim: Scrim): boolean, resolveGroupKey(scrim: Scrim, groupKey: string | boolean): string | undefined
- **ScrimLogicService** (service; microservices/matchmaking-service/src/scrim/scrim-logic/scrim-logic.service.ts)
  - decorators: Injectable
  - dependencies: scrimCrudService: ScrimCrudService, eventsService: EventProxyService, gameOrderService: GameOrderService, analyticsService: AnalyticsService, scrimQueue: Queue
  - public methods: popScrim(scrim: Scrim): Promise<void>, startScrim(scrim: Scrim): Promise<void>, deleteScrim(scrim: Scrim): Promise<void>
- **ScrimMetricsService** (service; microservices/matchmaking-service/src/scrim/scrim-metrics/scrim-metrics.service.ts)
  - decorators: Injectable
  - dependencies: scrimCrudService: ScrimCrudService
  - public methods: getScrimMetrics(): Promise<ScrimMetrics>
- **ScrimConsumer** (consumer; microservices/matchmaking-service/src/scrim/scrim.consumer.ts)
  - decorators: Processor
  - dependencies: matchmakingQueue: Queue, scrimService: ScrimService, scrimCrudService: ScrimCrudService
  - public methods: onFailure(_: Job, error: Error): Promise<void> [OnQueueFailed], scrimClock(): Promise<void> [Process], onApplicationBootstrap(): Promise<void>
- **ScrimController** (controller; microservices/matchmaking-service/src/scrim/scrim.controller.ts)
  - decorators: Controller
  - dependencies: scrimCrudService: ScrimCrudService, scrimService: ScrimService, scrimMetricsService: ScrimMetricsService
  - public methods: createScrim(payload: unknown): Promise<Scrim> [MessagePattern], createLFSScrim(payload: unknown): Promise<Scrim> [MessagePattern], updateLFSScrimPlayers(payload: unknown): Promise<boolean> [MessagePattern], getAllScrims(payload: unknown): Promise<Scrim[]> [MessagePattern], getScrim(payload: unknown): Promise<Scrim> [MessagePattern], joinScrim(payload: unknown): Promise<boolean> [MessagePattern], leaveScrim(payload: unknown): Promise<boolean> [MessagePattern], checkIn(payload: unknown): Promise<boolean> [MessagePattern], cancelScrim(payload: unknown): Promise<Scrim> [MessagePattern], getScrimMetrics(): Promise<ScrimMetrics> [MessagePattern], getScrimByPlayer(payload: unknown): Promise<Scrim | null> [MessagePattern], getScrimBySubmissionId(payload: unknown): Promise<Scrim> [MessagePattern], completeScrim(payload: unknown): Promise<Scrim | null> [MessagePattern], setScrimLocked(payload: unknown): Promise<boolean> [MessagePattern]
- **ScrimService** (service; microservices/matchmaking-service/src/scrim/scrim.service.ts)
  - decorators: Injectable
  - dependencies: scrimCrudService: ScrimCrudService, eventsService: EventProxyService, scrimLogicService: ScrimLogicService, scrimGroupService: ScrimGroupService, analyticsService: AnalyticsService
  - public methods: createScrim({ authorId, organizationId, gameModeId, skillGroupId, settings, join, }: CreateScrimOptions): Promise<Scrim>, createLFSScrim({ authorId, organizationId, gameModeId, skillGroupId, settings, numRounds, join, }: CreateLFSScrimRequest): Promise<Scrim>, updateLFSScrimPlayers({ scrimId, players, games, }: UpdateLFSScrimPlayersRequest): Promise<boolean>, joinScrim({ scrimId, playerId, playerName, leaveAfter, createGroup, joinGroup, }: JoinScrimOptions): Promise<Scrim>, leaveScrim(scrimId: string, playerId: number): Promise<Scrim>, checkIn(scrimId: string, playerId: number): Promise<Scrim>, cancelScrim(scrimId: string): Promise<Scrim>, completeScrim(scrimId: string, playerId?: number): Promise<Scrim>, setScrimLocked(scrimId: string, locked: boolean): Promise<Scrim>, publishScrimUpdate(scrimId: string): Promise<Scrim>

### Data Contracts and Interfaces

#### Context: scrim

- classes:
  - ScrimEventSubscriber (microservices/matchmaking-service/src/scrim/scrim.event-subscriber.ts)
    - public properties: onSubmissionReset, onSubmissionRejectionAdded, onScrimSaved
    - public methods: onApplicationBootstrap(): Promise<void>

## Workspace: microservices/notification-service

- Files parsed: 15
- Exported entities: 17
- Module classes: 7
- Runtime classes: 7
- Data/interface entities: 3

### Module Definitions

- **AppModule** (microservices/notification-service/src/app.module.ts)
  - imports: ScrimModule, MemberModule, SubmissionModule, MatchModule, NotificationModule, PlayerModule
  - providers: none
  - controllers: none
  - exports: none
- **MatchModule** (microservices/notification-service/src/match/match.module.ts)
  - imports: EventsModule, BotModule, CoreModule
  - providers: MatchService
  - controllers: none
  - exports: none
- **MemberModule** (microservices/notification-service/src/member/member.module.ts)
  - imports: EventsModule, BotModule, CoreModule
  - providers: MemberService
  - controllers: none
  - exports: none
- **NotificationModule** (microservices/notification-service/src/notification/notification.module.ts)
  - imports: RedisModule, BotModule
  - providers: NotificationService
  - controllers: NotificationController
  - exports: NotificationService
- **PlayerModule** (microservices/notification-service/src/player/player.module.ts)
  - imports: EventsModule, BotModule, CoreModule
  - providers: PlayerService
  - controllers: none
  - exports: none
- **ScrimModule** (microservices/notification-service/src/scrim/scrim.module.ts)
  - imports: EventsModule, BotModule, MatchmakingModule, CoreModule
  - providers: ScrimService
  - controllers: none
  - exports: none
- **SubmissionModule** (microservices/notification-service/src/submission/submission.module.ts)
  - imports: EventsModule, BotModule, CoreModule, RedisModule, MatchmakingModule
  - providers: SubmissionService
  - controllers: none
  - exports: none

### Runtime Classes (Public Methods)

#### Context: match

- **MatchService** (service; microservices/notification-service/src/match/match.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, botService: BotService, coreService: CoreService
  - public methods: sendReportCard(databaseIds: MatchDatabaseIds): Promise<void> [SprocketEvent]

#### Context: member

- **MemberService** (service; microservices/notification-service/src/member/member.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, botService: BotService, coreService: CoreService
  - public methods: sendQueueBanNotification(restriction: MemberRestriction): Promise<void> [SprocketEvent]

#### Context: notification

- **NotificationController** (controller; microservices/notification-service/src/notification/notification.controller.ts)
  - decorators: Controller
  - dependencies: notificationService: NotificationService
  - public methods: sendNotification(payload: unknown): Promise<NotificationOutput<NotificationEndpoint.SendNotification>> [MessagePattern]
- **NotificationService** (service; microservices/notification-service/src/notification/notification.service.ts)
  - decorators: Injectable
  - dependencies: redisService: RedisService, botService: BotService
  - public methods: sendNotification(data: NotificationInput<NotificationEndpoint.SendNotification>): Promise<NotificationOutput<NotificationEndpoint.SendNotification>>

#### Context: player

- **PlayerService** (service; microservices/notification-service/src/player/player.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, botService: BotService, coreService: CoreService
  - public methods: sendSkillGroupChanged(sgChangedPayload: PlayerSkillGroupChangedType): Promise<void> [SprocketEvent]

#### Context: scrim

- **ScrimService** (service; microservices/notification-service/src/scrim/scrim.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, botService: BotService, coreService: CoreService, matchmakingService: MatchmakingService
  - public methods: sendScrimCreatedNotifications(scrim: Scrim): Promise<void> [SprocketEvent], sendQueuePoppedNotifications(scrim: Scrim): Promise<void> [SprocketEvent], sendLobbyNotifications(scrim: Scrim): Promise<void> [SprocketEvent], sendReportCard(scrim: Scrim & {databaseIds: ScrimDatabaseIds;}): Promise<void> [SprocketEvent], getScrim(scrimId: string): Promise<Scrim | null>

#### Context: submission

- **SubmissionService** (service; microservices/notification-service/src/submission/submission.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, botService: BotService, coreService: CoreService, redisService: RedisService, matchmakingService: MatchmakingService
  - public methods: sendSubmissionRatifyingNotifications(payload: EventPayload<EventTopic.SubmissionRatifying>): Promise<void> [SprocketEvent], sendSubmissionRejectedNotifications(payload: EventPayload<EventTopic.SubmissionRejected>): Promise<void> [SprocketEvent], sendScrimSubmissionRatifyingNotifications(submission: ScrimReplaySubmission | LFSReplaySubmission): Promise<void>, sendMatchSubmissionRatifyingNotifications(submission: MatchReplaySubmission): Promise<void>, sendScrimSubmissionRejectedNotifications(submission: ScrimReplaySubmission): Promise<void>, sendMatchSubmissionRejectedNotifications(submission: MatchReplaySubmission & {id: string;}): Promise<void>

### Data Contracts and Interfaces

#### Context: member

- interfaces:
  - Member (microservices/notification-service/src/member/member.types.ts) -> id: number
  - MemberRestriction (microservices/notification-service/src/member/member.types.ts) -> id: number, type: MemberRestrictionType, expiration: Date, reason: string, manualExpiration?: Date, manualExpirationReason?: string, member: Member
- enums:
  - MemberRestrictionType (microservices/notification-service/src/member/member.types.ts) -> QUEUE_BAN, RATIFICATION_BAN

## Workspace: microservices/image-generation-service

- Files parsed: 7
- Exported entities: 12
- Module classes: 2
- Runtime classes: 3
- Data/interface entities: 7

### Module Definitions

- **AppModule** (microservices/image-generation-service/src/app.module.ts)
  - imports: ImageGenerationModule
  - providers: none
  - controllers: none
  - exports: none
- **ImageGenerationModule** (microservices/image-generation-service/src/image-generation/image-generation.module.ts)
  - imports: MinioModule
  - providers: ImageGenerationService, SvgTransformationService
  - controllers: ImageGenerationController
  - exports: none

### Runtime Classes (Public Methods)

#### Context: image-generation

- **ImageGenerationController** (controller; microservices/image-generation-service/src/image-generation/image-generation.controller.ts)
  - decorators: Controller
  - dependencies: imageGenerationService: ImageGenerationService
  - public methods: generateImage(payload: unknown): Promise<string> [MessagePattern], createImage(context: RmqContext): Promise<boolean> [MessagePattern]
- **ImageGenerationService** (service; microservices/image-generation-service/src/image-generation/image-generation.service.ts)
  - decorators: Injectable
  - dependencies: minioService: MinioService, svgTransformationService: SvgTransformationService
  - public methods: processSvg(inputFileKey: string, outputFileKey: string, data: Template): Promise<string>
- **SvgTransformationService** (service; microservices/image-generation-service/src/image-generation/svg-transformation/svg-transformation.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: getElDimension(el: Element): Promise<Dimension>, resolveTargetImage(el: Element): Promise<Element | false>, applyImageTransformation(el: Element, value: string, options: ImageTransformationsOptions): Promise<void>, applyTextTransformation(el: Element, value: string, options: TextTransformationOptions): Promise<void>, applyFillTransformation(el: Element, value: string): Promise<void>, applyStrokeTransformation(el: Element, value: string): Promise<void>, extractDataFromStructure(key: string, data: TemplateStructure): DataLeaf | false, transformElement(el: Element, data: TemplateStructure): Promise<void>

### Data Contracts and Interfaces

#### Context: image-generation

- type aliases:
  - Dimension (microservices/image-generation-service/src/image-generation/types.ts) -> z.infer<typeof dimensionSchema>
  - ImageTransformationsOptions (microservices/image-generation-service/src/image-generation/types.ts) -> z.infer<typeof imageTransformationOptions>
  - SprocketData (microservices/image-generation-service/src/image-generation/types.ts) -> z.infer<typeof sprocketDataSchema>
  - TextTransformationOptions (microservices/image-generation-service/src/image-generation/types.ts) -> z.infer<typeof textTransformationOptions>

#### Context: prototype.types.ts

- interfaces:
  - InputDatum (microservices/image-generation-service/src/prototype.types.ts) -> none
- type aliases:
  - Dimension (microservices/image-generation-service/src/prototype.types.ts) -> zod.infer<typeof dimensionSchema>
  - Operation (microservices/image-generation-service/src/prototype.types.ts) -> zod.infer<typeof operationSchema>

## Workspace: microservices/server-analytics-service

- Files parsed: 5
- Exported entities: 5
- Module classes: 2
- Runtime classes: 2
- Data/interface entities: 1

### Module Definitions

- **AnalyticsModule** (microservices/server-analytics-service/src/analytics/analytics.module.ts)
  - imports: none
  - providers: AnalyticsService
  - controllers: AnalyticsController
  - exports: none
- **AppModule** (microservices/server-analytics-service/src/app.module.ts)
  - imports: AnalyticsModule
  - providers: none
  - controllers: none
  - exports: none

### Runtime Classes (Public Methods)

#### Context: analytics

- **AnalyticsController** (controller; microservices/server-analytics-service/src/analytics/analytics.controller.ts)
  - decorators: Controller
  - dependencies: analyticsService: AnalyticsService
  - public methods: track(data: unknown): Promise<AnalyticsOutput<AnalyticsEndpoint.Analytics>> [MessagePattern]
- **AnalyticsService** (service; microservices/server-analytics-service/src/analytics/analytics.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none

### Data Contracts and Interfaces

#### Context: analytics

- type aliases:
  - AnalyticsPoint (microservices/server-analytics-service/src/analytics/analytics.schema.ts) -> z.infer<typeof AnalyticsPointSchema>

## Workspace: clients/discord-bot

- Files parsed: 36
- Exported entities: 64
- Module classes: 12
- Runtime classes: 16
- Data/interface entities: 36

### Module Definitions

- **AppModule** (clients/discord-bot/src/app.module.ts)
  - imports: GlobalModule, CoreModule, MarshalModule, DiscordModule, EmbedModule, NotificationsModule, EventsModule, CommandsModule, SprocketEventsModule
  - providers: GlobalModule, EmbedService
  - controllers: none
  - exports: none
- **AdministratorCommandsModule** (clients/discord-bot/src/commands/administrator-commands/administrator-commands.module.ts)
  - imports: DiscordModule, CommandsModule, EmbedModule, CoreModule, EventsModule
  - providers: DeveloperCommandsMarshal, DatabaseSyncMarshal
  - controllers: none
  - exports: none
- **CommandsModule** (clients/discord-bot/src/commands/commands.module.ts)
  - imports: AdministratorCommandsModule, MemberCommandsModule
  - providers: none
  - controllers: none
  - exports: none
- **MemberCommandsModule** (clients/discord-bot/src/commands/member-commands/member-commands.module.ts)
  - imports: DiscordModule, CommandsModule, CoreModule, EmbedModule, NotificationsModule
  - providers: HelpMarshal, ReportCardMarshal
  - controllers: none
  - exports: none
- **DiscordModule** (clients/discord-bot/src/discord/discord.module.ts)
  - imports: forwardRef(...)
  - providers: {...}, DiscordService
  - controllers: none
  - exports: "DISCORD_CLIENT"
- **EmbedModule** (clients/discord-bot/src/embed/embed.module.ts)
  - imports: CoreModule
  - providers: EmbedService
  - controllers: none
  - exports: EmbedService
- **EventsModule** (clients/discord-bot/src/events/events.module.ts)
  - imports: DiscordModule, CommandsModule, CoreModule, EmbedModule
  - providers: DiscordSyncMarshal
  - controllers: none
  - exports: none
- **GlobalModule** (clients/discord-bot/src/global.module.ts)
  - imports: AnalyticsModule
  - providers: none
  - controllers: none
  - exports: AnalyticsModule
- **CommandsModule** (clients/discord-bot/src/marshal/commands/commands.module.ts)
  - imports: none
  - providers: CommandManagerService
  - controllers: none
  - exports: CommandManagerService
- **MarshalModule** (clients/discord-bot/src/marshal/marshal.module.ts)
  - imports: forwardRef(...), EmbedModule, CoreModule, CommandsModule
  - providers: EmbedService
  - controllers: none
  - exports: EmbedService
- **NotificationsModule** (clients/discord-bot/src/notifications/notifications.module.ts)
  - imports: DiscordModule, EmbedModule, MinioModule, CoreModule
  - providers: NotificationsService
  - controllers: NotificationsController
  - exports: NotificationsService
- **SprocketEventsModule** (clients/discord-bot/src/sprocket-events/sprocket-events.module.ts)
  - imports: DiscordModule, CoreModule, EventsModule
  - providers: SprocketEventsService
  - controllers: none
  - exports: none

### Runtime Classes (Public Methods)

#### Context: commands

- **CommandDecoratorTestMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/command-decorator-test.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: test(m: Message, c: MarshalCommandContext): Promise<void> [Command], testMoreArgs(m: Message, c: MarshalCommandContext): Promise<void> [Command]
- **DatabaseSyncMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/database-sync.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: syncNames(m: Message): Promise<void> [Command]
- **DebugCommandsMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/debug-commands.marshal.ts)
  - decorators: none
  - dependencies: cms: CommandManagerService, coreService: CoreService, analyticsService: AnalyticsService, embedService: EmbedService, botClient: Client, eventsService: EventsService
  - public methods: wizardDebug(m: Message): Promise<void> [Command], changeTeam(): Promise<void> [Command]
- **DeveloperCommandsMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/developer-commands.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: brick(m: Message): Promise<void> [Command]
- **MiscCommandsMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/misc-commands.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: ping(m: Message): Promise<void> [Command], error(m: Message, context: MarshalCommandContext): Promise<void> [Command], embed(m: Message, c: MarshalCommandContext): Promise<void> [Command]
- **SprocketConfigurationMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/sprocket-configuration.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: getSprocketConfig(m: Message, context: MarshalCommandContext): Promise<void> [Command]
- **SprocketStatusMarshal** (marshal; clients/discord-bot/src/commands/administrator-commands/sprocket-status.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: status(m: Message): Promise<void> [Command]
- **HelpMarshal** (marshal; clients/discord-bot/src/commands/member-commands/help/help.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: help(m: Message): Promise<void> [Command], helpSpecific(m: Message, c: MarshalCommandContext): Promise<void> [Command]
- **ReportCardMarshal** (marshal; clients/discord-bot/src/commands/member-commands/report-card.marshal.ts)
  - decorators: none
  - dependencies: cms: CommandManagerService, coreService: CoreService, analyticsService: AnalyticsService, embedService: EmbedService, botClient: Client, notificationsService: NotificationsService
  - public methods: reportCard(m: Message, c: MarshalCommandContext): Promise<void> [Command]

#### Context: discord

- **DiscordService** (service; clients/discord-bot/src/discord/discord.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: none

#### Context: embed

- **EmbedService** (service; clients/discord-bot/src/embed/embed.service.ts)
  - decorators: Injectable
  - dependencies: coreService: CoreService
  - public methods: brandEmbed(data: Embed, options: EmbedBrandingOptions, _organizationId?: number): Promise<MessageEmbed>, embed(options: EmbedOptions, organizationId?: number): Promise<MessageEmbed>

#### Context: events

- **DiscordSyncMarshal** (marshal; clients/discord-bot/src/events/discord-sync.marshal.ts)
  - decorators: none
  - dependencies: none
  - public methods: syncMe(m: Message): Promise<void> [Command], guildMemberAdd([member]: ClientEvents[ClientEvent.guildMemberAdd]): Promise<void> [Event], guildMemberUpdated([ , newMember, ]: ClientEvents[ClientEvent.guildMemberUpdate ]): Promise<void> [Event], syncMember(member: GuildMember): Promise<void>, getOrganizationDiscordGuildsByGuild(guildId: string): Promise<GetOrganizationDiscordGuildsByGuildResponse>

#### Context: marshal

- **CommandManagerService** (service; clients/discord-bot/src/marshal/commands/command-manager.service.ts)
  - decorators: Injectable
  - dependencies: none
  - public methods: commands(): CommandSpec[], handleMessage(message: Message): Promise<void>, registerCommand(meta: LinkedCommandMeta): void, registerNotFoundCommand(meta: LinkedCommandNotFoundMeta): void, getCommandSpecs(commandName: string): CommandSpec[]

#### Context: notifications

- **NotificationsController** (controller; clients/discord-bot/src/notifications/notifications.controller.ts)
  - decorators: Controller
  - dependencies: notificationService: NotificationsService
  - public methods: sendGuildTextMessage(payload: unknown): Promise<boolean> [MessagePattern], sendDirectMessage(payload: unknown): Promise<boolean> [MessagePattern], sendWebhookMessage(payload: unknown): Promise<boolean> [MessagePattern]
- **NotificationsService** (service; clients/discord-bot/src/notifications/notifications.service.ts)
  - decorators: Injectable
  - dependencies: discordClient: Client, embedService: EmbedService, minioService: MinioService, coreService: CoreService
  - public methods: downloadAttachment(attachment: Attachment | string): Promise<MessageAttachment>, sendGuildTextMessage(channelId: string, content: MessageContent, brandingOptions?: BrandingOptions): Promise<boolean>, sendDirectMessage(userId: string, content: MessageContent, brandingOptions?: BrandingOptions): Promise<boolean>, sendWebhookMessage(webhookUrl: string, content: MessageContent & WebhookMessageOptions, brandingOptions?: BrandingOptions): Promise<boolean>

#### Context: sprocket-events

- **SprocketEventsService** (service; clients/discord-bot/src/sprocket-events/sprocket-events.service.ts)
  - decorators: Injectable
  - dependencies: eventsService: EventsService, discordClient: Client, coreService: CoreService
  - public methods: onSkillGroupChange(payload: PlayerSkillGroupChangedType): Promise<void> [SprocketEvent], onTeamChange(payload: PlayerTeamChanged): Promise<void> [SprocketEvent]

### Data Contracts and Interfaces

#### Context: embed

- interfaces:
  - EmbedOptions (clients/discord-bot/src/embed/embed.service.ts) -> title?: string, description?: string, fields?: EmbedFieldData[], footer?: MessageEmbedFooter

#### Context: enums

- enums:
  - Unicode (clients/discord-bot/src/enums/unicode.ts) -> ZERO_WIDTH_SPACE

#### Context: marshal

- classes:
  - CommandError (clients/discord-bot/src/marshal/command-error.ts)
    - public properties: name
    - public methods: replyTo(m: Message): Promise<void>, log(): void
  - Marshal (clients/discord-bot/src/marshal/marshal.ts)
    - public properties: none
    - public methods: none
  - Wizard (clients/discord-bot/src/marshal/wizard/wizard.ts)
    - public properties: defaultFilterFunctions: Record<WizardType, (...args: any[]) => boolean>
    - public methods: add(func: WizardFunction, opts?: StepOptions): Wizard, finally(func: WizardFinalFunction): Wizard, onFail(func: WizardFinalFunction): Wizard, start(): Promise<void>, next(messages: Map<string, Message>, reason: string): void
- interfaces:
  - MarshalCommandContext (clients/discord-bot/src/marshal/commands/commands.types.ts) -> args: Record<string, unknown>, author: | { id: number; } | false
  - MarshalEventContext (clients/discord-bot/src/marshal/events/events.types.ts) -> args: Record<string, unknown>
  - Step (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> func: WizardFunction, opts?: StepOptions
  - StepOptions (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> filter?: CollectorFilterFunction, timeout?: number, collectorType?: WizardType, collectorTarget?: Message, max?: number, resetTimerOnFail?: boolean, resetTimerOnWait?: boolean
- enums:
  - ClientEvent (clients/discord-bot/src/marshal/events/events.types.ts) -> ready, guildMemberAdd, guildMemberUpdate, messageCreate
  - MarshalMetadataKey (clients/discord-bot/src/marshal/types.ts) -> Command, CommandNotFound, Event
  - WizardExitStatus (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> SUCCESS, WAIT, FAIL, EXIT
  - WizardType (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> MESSAGE, REACTION, COMPONENT
- type aliases:
  - CommandErrorType (clients/discord-bot/src/marshal/command-error.ts) -> "UserError" | "InternalError" | "UnknownError"
  - CommandArg (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandArgSchema>
  - CommandArgType (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandArgTypeSchema>
  - CommandFunction (clients/discord-bot/src/marshal/commands/commands.types.ts) -> (m: Message, c: MarshalCommandContext) => Promise<unknown>
  - CommandMeta (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandMetaSchema>
  - CommandNotFoundMeta (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandNotFoundMetaSchema>
  - CommandRole (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandRoleSchema>
  - CommandSpec (clients/discord-bot/src/marshal/commands/commands.types.ts) -> z.infer<typeof CommandSpecSchema>
  - HookFunction (clients/discord-bot/src/marshal/commands/commands.types.ts) -> (m: Message) => Promise<unknown>
  - LinkedCommandMeta (clients/discord-bot/src/marshal/commands/commands.types.ts) -> CommandMeta & { function: CommandFunction; }
  - LinkedCommandNotFoundMeta (clients/discord-bot/src/marshal/commands/commands.types.ts) -> CommandNotFoundMeta & { function: HookFunction; }
  - EventFunction (clients/discord-bot/src/marshal/events/events.types.ts) -> (e: ClientEvents[keyof ClientEvents]) => Promise<void>
  - EventMeta (clients/discord-bot/src/marshal/events/events.types.ts) -> z.infer<typeof EventMetaSchema>
  - EventSpec (clients/discord-bot/src/marshal/events/events.types.ts) -> z.infer<typeof EventSpecSchema>
  - LinkedEventMeta (clients/discord-bot/src/marshal/events/events.types.ts) -> EventMeta & { function: EventFunction; }
  - CollectorFilterFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> | MessageCollectorFilterFunction | ReactionCollectorFilterFunction | InteractionCollectorFilterFunction
  - InteractionCollectorFilterFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> ( interaction: MessageComponentInteraction, ) => boolean
  - MessageCollectorFilterFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> (message: Message) => boolean
  - ReactionCollectorFilterFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> (reaction: MessageReaction, user: User) => boolean
  - ValidWizardCollector (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> | MessageCollector | ReactionCollector | InteractionCollector<MessageComponentInteraction>
  - WizardFinalFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> (messages: Map<string, Message>) => Promise<any>
  - WizardFunction (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> ( ...args: any[] ) => Promise<WizardFunctionOutput> | WizardFunctionOutput
  - WizardFunctionOutput (clients/discord-bot/src/marshal/wizard/wizard.types.ts) -> [boolean, string?] | [WizardExitStatus, string?]

