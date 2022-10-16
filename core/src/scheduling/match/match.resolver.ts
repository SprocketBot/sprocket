import {Logger, UseGuards} from "@nestjs/common";
import {
    Args,
    Mutation,
    Query,
    ResolveField,
    Resolver,
    Root,
} from "@nestjs/graphql";
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {
    EventsService, EventTopic, Parser, ReplaySubmissionStatus, ResponseStatus, SubmissionEndpoint, SubmissionService,
} from "@sprocketbot/common";
import {DataSource, Repository} from "typeorm";

import type {GameMode} from "../../database";
import {
    Franchise,
    GameSkillGroup,
    Match,
    MatchParent,
    Player,
    Round,
    ScheduleFixture,
    ScheduleGroup,
    Team,
} from "../../database";
import type {League} from "../../database/mledb";
import {
    LegacyGameMode, MLE_OrganizationTeam, MLE_Series, MLE_SeriesReplay, MLE_Team,
} from "../../database/mledb";
import {SeriesToMatchParent} from "../../database/mledb-bridge/series_to_match_parent.model";
import type {MatchSubmissionStatus} from "../../database/scheduling/match/match.model";
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
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        @InjectRepository(Round) private readonly roundRepo: Repository<Round>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
        @InjectRepository(ScheduleFixture) private readonly fixtureRepo: Repository<ScheduleFixture>,
        @InjectRepository(MLE_Team) private readonly mleTeamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_Series) private readonly mleSeriesRepo: Repository<MLE_Series>,
        @InjectRepository(MLE_SeriesReplay) private readonly seriesReplayRepo: Repository<MLE_SeriesReplay>,
        @InjectRepository(SeriesToMatchParent)
        private readonly seriesToMatchParentRepo: Repository<SeriesToMatchParent>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Query(() => Match)
    async getMatchBySubmissionId(@Args("submissionId") submissionId: string): Promise<Match> {
        return this.matchService.getMatch({where: {submissionId}});
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async postReportCard(@Args("matchId") matchId: number): Promise<string> {
        const match = await this.matchService.getMatchById(matchId);

        if (!match.skillGroup) {
            match.skillGroup = await this.populate.populateOneOrFail(Match, match, "skillGroup");
        }
        if (!match.skillGroup.profile) {
            const skillGroupProfile = await this.populate.populateOneOrFail(
                GameSkillGroup,
                match.skillGroup,
                "profile",
            );
            match.skillGroup.profile = skillGroupProfile;
        }
        if (!match.matchParent) {
            match.matchParent = await this.populate.populateOneOrFail(Match, match, "matchParent");
        }

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
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async markSeriesNCP(@Args("matchId") matchId: number, @Args("isNcp") isNcp: boolean, @Args("winningTeamId", {nullable: true}) winningTeamId?: number, @Args("numReplays", {nullable: true}) numReplays?: number): Promise<string> {

        // Perform NCPs in a single transaction
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            this.logger.verbose(`Marking series ${matchId} as NCP:${isNcp}. Winning team ID: ${winningTeamId}, with ${numReplays} replays.`);
            await this.matchService.markSeriesNcp(matchId, isNcp, winningTeamId, numReplays);

            // Have to translate from Team ID to Franchise Profile to get name (for
            // MLEDB schema)
            const team = await this.teamRepo.findOneOrFail({
                where: {
                    id: winningTeamId,
                },
                relations: {
                    franchise: {
                        profile: true,
                    },
                },
            });

            const match = await this.matchRepo.findOneOrFail({
                where: {
                    id: matchId,
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

            await this.mledbMatchService.markSeriesNcp(bridgeObject.seriesId, isNcp, team.franchise.profile.title);

            await qr.commitTransaction();
            this.logger.verbose(`Successfully marked series ${matchId} NCP:${isNcp}`);
            return "NCP marked successfully";
        } catch (e) {
            this.logger.error(`Failed to mark series ${matchId} NCP. Got error ${e}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async markRoundsNCP(@Args("roundIds", {type: () => [Number]}) roundIds: number[], @Args("isNcp") isNcp: boolean, @Args("winningTeamId", {nullable: true}) winningTeamId: number): Promise<string> {
        // Perform NCPs in a single transaction
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            this.logger.verbose(`Marking replays ${roundIds} as NCP:${isNcp}. Winning team ID: ${winningTeamId}`);
            // We need the actual team object from the DB for replay level NCPs
            const winningTeamInput = await this.teamRepo.findOneOrFail({
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
            await this.matchService.markReplaysNcp(roundIds, isNcp, winningTeamInput, undefined);

            // Have to translate from Team ID to Franchise Profile to get name (for
            // MLEDB schema)
            const winningMLETeam = await this.mleTeamRepo.findOneOrFail({
                where: {
                    name: winningTeamInput.franchise.profile.title,
                },
            });

            // Get MLEDB replayIds from the Sprocket replayIds
            const mleReplayIds = await Promise.all(roundIds.map(async rId => {
                const round = await this.roundRepo.findOneOrFail({
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
            this.logger.verbose(`Successfully marked replays ${roundIds} NCP:${isNcp}`);
            return "NCP marked successfully";
        } catch (e) {
            this.logger.error(`Failed to mark replays ${roundIds} NCP. Got error ${e}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    @Mutation(() => Number)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async addDummyReplay(@Args("matchId") matchId: number, @Args("winningTeamId") winningTeamId: number): Promise<number> {

        // Get the franchise object of the winning team
        const team = await this.teamRepo.findOneOrFail({
            where: {
                id: winningTeamId,
            },
            relations: {
                franchise: {
                    profile: true,
                },
            },
        });

        // Get the Sprocket match object we're adding to
        const match = await this.matchRepo.findOneOrFail({
            where: {
                id: matchId,
            },
            relations: {
                matchParent: {
                    fixture: true,
                },
            },
        });

        // We can't tell if home won if there is no homeFranchise, which atm
        // only exists on the ScheduleFixture
        if (!match.matchParent.fixture) {
            throw new Error("Creating dummy rounds for non-fixture matches is not yet supported");
        }

        // Check if homeWon
        const homeWon = (team.franchise.id === match.matchParent.fixture.homeFranchiseId);
        if (!homeWon && team.franchise.id !== match.matchParent.fixture.awayFranchiseId) {
            throw new Error("The team ID you've entered did not play in this match.");
        }

        // This is the 'translation' between Sprocket match ID and MLEDB series ID
        const bridgeObject = await this.seriesToMatchParentRepo.findOneOrFail({
            where: {
                matchParentId: match.matchParent.id,
            },
        });

        // And this is the MELDB series object
        const mleSeries = await this.mleSeriesRepo.findOneOrFail({
            where: {
                id: bridgeObject.seriesId,
            },
        });

        // Create dummy in Sprocket schema
        const sprocketRound = this.roundRepo.create();
        sprocketRound.match = match;
        sprocketRound.roundStats = {};
        sprocketRound.parser = Parser.BALLCHASING;
        sprocketRound.parserVersion = 1;
        sprocketRound.outputPath = "none";
        sprocketRound.isDummy = true;
        sprocketRound.homeWon = homeWon;

        await this.roundRepo.save(sprocketRound);

        // Create dummy in MLEDB schema
        const mleReplay = this.seriesReplayRepo.create();
        mleReplay.isDummy = true;
        mleReplay.winningTeamName = team.franchise.profile.title;
        mleReplay.duration = -1;
        mleReplay.overtime = false;
        mleReplay.series = mleSeries;

        await this.seriesReplayRepo.save(mleReplay);

        // Finally, return the roundID for future use
        return sprocketRound.id;
    }

    @ResolveField()
    async skillGroup(@Root() root: Match): Promise<GameSkillGroup> {
        if (root.skillGroup) return root.skillGroup;
        return this.populate.populateOneOrFail(Match, root, "skillGroup");
    }

    @ResolveField()
    async submissionStatus(@Root() root: Match): Promise<MatchSubmissionStatus> {
        const match = await this.matchRepo.findOneOrFail({
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
    async gameMode(@Root() root: Match): Promise<GameMode | undefined> {
        if (root.gameMode) return root.gameMode;
        return this.populate.populateOne(Match, root, "gameMode");
    }

    @ResolveField()
    async rounds(@Root() root: Match): Promise<Round[]> {
        if (root.rounds) return root.rounds;
        return this.populate.populateMany(Match, root, "rounds");
    }

    @ResolveField()
    async matchParent(@Root() root: Match): Promise<MatchParent> {
        if (root.matchParent) return root.matchParent;
        return this.populate.populateOneOrFail(Match, root, "matchParent");
    }
}
