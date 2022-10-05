import {Logger, UseGuards} from "@nestjs/common";
import {
    Args,
    Mutation,
    Query,
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
import {
    EventsService, EventTopic, ReplaySubmissionStatus, ResponseStatus, SubmissionEndpoint, SubmissionService,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import type {GameMode, Round} from "../../database";
import {
    Franchise,
    GameSkillGroup,
    Match,
    MatchParent,
    Player,    ScheduleFixture,
    ScheduleGroup,
} from "../../database";
import type {League} from "../../database/mledb";
import {LegacyGameMode, MLE_OrganizationTeam} from "../../database/mledb";
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
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        private readonly submissionService: SubmissionService,
    ) {}

    @Query(() => Match)
    async getMatchBySubmissionId(@Args("submissionId") submissionId: string): Promise<Match> {
        return this.matchService.getMatch({where: {submissionId} });
    }
    
    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async postReportCard(@Args("matchId") matchId: number): Promise<string> {
        const match = await this.matchService.getMatchById(matchId);

        if (!match.skillGroup) {
            match.skillGroup = await this.populate.populateOneOrFail(Match, match, "skillGroup");
        }
        if (!match.skillGroup.profile) {
            const skillGroupProfile = await this.populate.populateOneOrFail(GameSkillGroup, match.skillGroup, "profile");
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
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async markSeriesNCP(@Args("seriesId") seriesId: number, @Args("isNcp") isNcp: boolean, @Args("winningTeamId", {nullable: true}) winningTeamId?: number, @Args("numReplays", {nullable: true}) numReplays?: number): Promise<string> {
        this.logger.verbose(`Marking series ${seriesId} as NCP:${isNcp}. Winning team ID: ${winningTeamId}, with ${numReplays} replays.`);
        await this.matchService.markSeriesNcp(seriesId, isNcp, winningTeamId, numReplays);
        await this.mledbMatchService.markSeriesNcp(seriesId, isNcp, seriesType, winningTeamId);
        this.logger.verbose(`Successfully marked series ${seriesId} NCP:${isNcp}`);
        return "NCP marked successfully";
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

        const {
            scrimMeta, fixture, event,
        } = match.matchParent;

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
