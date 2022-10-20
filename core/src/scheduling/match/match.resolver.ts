import {Logger, UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {
    EventsService,
    EventTopic,
    ReplaySubmissionStatus,
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";
import {DataSource, Repository} from "typeorm";

import {SeriesToMatchParent} from "$bridge/series_to_match_parent.model";
import type {League} from "$mledb";
import {LegacyGameMode, MLE_OrganizationTeam, MLE_SeriesReplay, MLE_Team} from "$mledb";
import type {GameMode, GameSkillGroup, Round} from "$models";
import {Franchise, Match, MatchParent, Player, ScheduleFixture, ScheduleGroup} from "$models";
import {MatchRepository, RoundRepository, TeamRepository} from "$repositories";
import type {MatchSubmissionStatus} from "$types";

import {CurrentPlayer} from "../../franchise/player";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MledbMatchService} from "../../mledb/mledb-match/mledb-match.service";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import {MatchPlayerGuard} from "./match.guard";
import {MatchService} from "./match.service";

@Resolver(() => Match)
export class MatchResolver {
    private readonly logger = new Logger(MatchResolver.name);

    constructor(
        private readonly populate: PopulateService,
        private readonly matchService: MatchService,
        private readonly mledbMatchService: MledbMatchService,
        private readonly eventsService: EventsService,
        private readonly submissionService: SubmissionService,
        private readonly teamRepository: TeamRepository,
        @InjectRepository(MLE_Team) private readonly mleTeamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_SeriesReplay) private readonly seriesReplayRepo: Repository<MLE_SeriesReplay>,
        @InjectRepository(SeriesToMatchParent)
        private readonly seriesToMatchParentRepo: Repository<SeriesToMatchParent>,
        private readonly dataSource: DataSource,
        private readonly matchRepository: MatchRepository,
        private readonly roundRepository: RoundRepository,
    ) {}

    @Query(() => Match)
    async getMatchBySubmissionId(@Args("submissionId") submissionId: string): Promise<Match> {
        return this.matchRepository.getBySubmissionId(submissionId);
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async postReportCard(@Args("matchId") matchId: number): Promise<string> {
        const match = await this.matchRepository.getById(matchId, {
            relations: {
                skillGroup: {
                    profile: true,
                },
                matchParent: true,
            },
        });

        const fixture = await this.populate.populateOne(MatchParent, match.matchParent, "fixture");
        if (!fixture) {
            throw new Error("Fixture not found, this may not be league play!");
        }
        const awayFranchise = await this.populate.populateOneOrFail(ScheduleFixture, fixture, "awayFranchise");
        const homeFranchise = await this.populate.populateOneOrFail(ScheduleFixture, fixture, "homeFranchise");

        const awayFranchiseProfile = await this.populate.populateOneOrFail(Franchise, awayFranchise, "profile");
        const homeFranchiseProfile = await this.populate.populateOneOrFail(Franchise, homeFranchise, "profile");

        const week = await this.populate.populateOneOrFail(ScheduleFixture, fixture, "scheduleGroup");
        const season = await this.populate.populateOneOrFail(ScheduleGroup, week, "parentGroup");

        const gameMode = await this.populate.populateOneOrFail(Match, match, "gameMode");

        const mleSeries = await this.mledbMatchService.getMleSeries(
            awayFranchiseProfile.title,
            homeFranchiseProfile.title,
            week.start,
            season.start,
            gameMode.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD,
            // TODO: This is an awful hack
            match.skillGroup.profile.description.split(" ")[0].toUpperCase() as League,
        );

        await this.eventsService.publish(EventTopic.MatchSaved, {
            id: match.id,
            legacyId: mleSeries.id,
        });

        return "OKAY";
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async reprocessMatches(@Args("startDate") startDate: Date): Promise<string> {
        this.logger.verbose(`Starting to reprocess matches after ${startDate}.`);
        await this.matchService.resubmitAllMatchesAfter(startDate);
        this.logger.verbose(`ReprocessMatches job started.`);
        return "Job started";
    }

    @Mutation(() => String)
    @UseGuards(
        GqlJwtGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async markSeriesNCP(
        @Args("seriesId") seriesId: number,
        @Args("isNcp") isNcp: boolean,
        @Args("winningTeamId", {nullable: true}) winningTeamId?: number,
        @Args("numReplays", {nullable: true}) numReplays?: number,
    ): Promise<string> {
        // Perform NCPs in a single transaction
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            this.logger.verbose(
                `Marking series ${seriesId} as NCP:${isNcp}. Winning team ID: ${winningTeamId}, with ${numReplays} replays.`,
            );
            await this.matchService.markSeriesNcp(seriesId, isNcp, winningTeamId, numReplays);

            // Have to translate from Team ID to Franchise Profile to get name (for
            // MLEDB schema)
            const team = await this.teamRepository.getOrNull({
                where: {id: winningTeamId},
                relations: {
                    franchise: {
                        profile: true,
                    },
                },
            });

            const match = await this.matchRepository.findOneOrFail({
                where: {
                    id: seriesId,
                },
                relations: {
                    matchParent: true,
                },
            });

            const bridgeObject = await this.seriesToMatchParentRepo.findOneOrFail({
                where: {
                    matchParentId: match.matchParent.id,
                },
            });

            await this.mledbMatchService.markSeriesNcp(bridgeObject.seriesId, isNcp, team?.franchise.profile.title);

            await qr.commitTransaction();
            this.logger.verbose(`Successfully marked series ${seriesId} NCP:${isNcp}`);
            return "NCP marked successfully";
        } catch (e) {
            this.logger.error(`Failed to mark series ${seriesId} NCP. Got error ${e}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    @Mutation(() => String)
    @UseGuards(
        GqlJwtGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async markReplaysNCP(
        @Args("replayIds", {type: () => [Number]}) replayIds: number[],
        @Args("isNcp") isNcp: boolean,
        @Args("winningTeamId", {nullable: true}) winningTeamId: number,
    ): Promise<string> {
        // Perform NCPs in a single transaction
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            this.logger.verbose(`Marking replays ${replayIds} as NCP:${isNcp}. Winning team ID: ${winningTeamId}`);
            // We need the actual team object from the DB for replay level NCPs
            const winningTeamInput = await this.teamRepository.findOneOrFail({
                where: {
                    id: winningTeamId,
                },
                relations: {
                    franchise: {
                        profile: true,
                    },
                },
            });

            // Invalidations apply at the series level, not replay, so we don't
            // apply one here. Save to Sprocket schema.
            await this.matchService.markReplaysNcp(replayIds, isNcp, winningTeamInput, undefined);

            // Have to translate from Team ID to Franchise Profile to get name (for
            // MLEDB schema)
            const winningMLETeam = await this.mleTeamRepo.findOneOrFail({
                where: {
                    name: winningTeamInput.franchise.profile.title,
                },
            });

            // Get MLEDB replayIds from the Sprocket replayIds
            const mleReplayIds = await Promise.all(
                replayIds.map(async rId => {
                    const round = await this.roundRepository.findOneOrFail({
                        where: {
                            id: rId,
                        },
                    });

                    // This is horrifically hacky due to our lack of strict typing
                    // on the ballchasing output. Will not be necessary once we
                    // ditch MLEDB and ballchasing.
                    const BCID: string = (round.roundStats as {ballchasingId: string}).ballchasingId;

                    const mleReplay = await this.seriesReplayRepo.findOneOrFail({
                        where: {
                            ballchasingId: BCID,
                        },
                    });

                    return mleReplay.id;
                }),
            );

            // Save round NCPs to MLEDB schema
            await this.mledbMatchService.markReplaysNcp(mleReplayIds, isNcp, winningMLETeam);

            await qr.commitTransaction();
            this.logger.verbose(`Successfully marked replays ${replayIds} NCP:${isNcp}`);
            return "NCP marked successfully";
        } catch (e) {
            this.logger.error(`Failed to mark replays ${replayIds} NCP. Got error ${e}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    @ResolveField()
    async skillGroup(@Root() match: Partial<Match>): Promise<GameSkillGroup> {
        return match.skillGroup ?? this.populate.populateOneOrFail(Match, match as Match, "skillGroup");
    }

    @ResolveField()
    async submissionStatus(@Root() root: Match): Promise<MatchSubmissionStatus> {
        const match = await this.matchRepository.findOneOrFail({
            where: {
                id: root.id,
            },
            relations: {
                rounds: true,
                matchParent: {
                    scrimMeta: true,
                    fixture: true,
                },
            },
        });

        const {scrimMeta, fixture, event} = match.matchParent;

        // If match is related to a scrim, then the submission must be completed because the scrim is saved in the DB
        if (scrimMeta) return "completed";

        // Matches must relate to either a scrim, fixture, or event
        if (!fixture && !event) throw new Error(`Match is related to neither a scrim or a fixture`);

        // If the fixture has stats, the submission is completed
        const isComplete = match.rounds.length > 0 || match.isDummy;
        if (isComplete) return "completed";

        // Fixtures/Events must have a submissionId
        if (!match.submissionId) throw new Error(`Match ${match.id} is not a scrim and has no submissionId`);

        // Get submission to check status
        const result = await this.submissionService.send(SubmissionEndpoint.GetSubmissionIfExists, match.submissionId);
        if (result.status === ResponseStatus.ERROR) throw result.error;
        const {submission} = result.data;

        if (!submission) return "submitting";

        if (submission.status === ReplaySubmissionStatus.RATIFYING) return "ratifying";

        return "submitting";
    }

    @ResolveField()
    @UseGuards(GqlJwtGuard, MatchPlayerGuard)
    async canSubmit(@CurrentPlayer() player: Player, @Root() root: Match): Promise<boolean> {
        if (root.canSubmit) return root.canSubmit;
        if (!root.submissionId) throw new Error(`Match has no submissionId`);

        const result = await this.submissionService.send(SubmissionEndpoint.CanSubmitReplays, {
            playerId: player.member.id,
            submissionId: root.submissionId,
        });
        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data.canSubmit;
    }

    @ResolveField()
    @UseGuards(GqlJwtGuard, MatchPlayerGuard)
    async canRatify(@CurrentPlayer() player: Player, @Root() root: Match): Promise<boolean> {
        if (root.canRatify) return root.canRatify;
        if (!root.submissionId) throw new Error(`Match has no submissionId`);

        const result = await this.submissionService.send(SubmissionEndpoint.CanRatifySubmission, {
            playerId: player.member.id,
            submissionId: root.submissionId,
        });
        if (result.status === ResponseStatus.ERROR) throw result.error;
        return result.data.canRatify;
    }

    @ResolveField()
    async gameMode(@Root() match: Partial<Match>): Promise<GameMode | undefined> {
        return match.gameMode ?? this.populate.populateOne(Match, match as Match, "gameMode");
    }

    @ResolveField()
    async rounds(@Root() match: Partial<Match>): Promise<Round[]> {
        return match.rounds ?? this.populate.populateMany(Match, match as Match, "rounds");
    }

    @ResolveField()
    async matchParent(@Root() match: Partial<Match>): Promise<MatchParent> {
        return match.matchParent ?? this.populate.populateOneOrFail(Match, match as Match, "matchParent");
    }
}
