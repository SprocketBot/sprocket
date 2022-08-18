import {Injectable, Logger} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, ReplaySubmission, Scrim,
} from "@sprocketbot/common";
import {Parser} from "@sprocketbot/common";
import {flatten} from "lodash";
import type {QueryRunner} from "typeorm";
import {Connection, Repository} from "typeorm";

import type {User} from "../../database";
import {
    EligibilityData, Franchise, GameSkillGroup,
    Match,
    MatchParent,
    PlayerStatLine,
    Round,
    ScheduleFixture,
    ScheduleGroup,
    ScrimMeta,
    TeamStatLine,
} from "../../database";
import type {League, MLE_Platform} from "../../database/mledb";
import {LegacyGameMode} from "../../database/mledb";
import {EloService} from "../../elo";
import {PlayerService} from "../../franchise";
import {MledbPlayerService, MledbScrimService} from "../../mledb";
import {MledbMatchService} from "../../mledb/mledb-match/mledb-match.service";
import {SprocketRatingService} from "../../sprocket-rating/sprocket-rating.service";
import {PopulateService} from "../../util/populate/populate.service";
import {BallchasingConverterService} from "./ballchasing-converter";
import type {SaveScrimFinalizationReturn} from "./finalization.types";

@Injectable()
export class FinalizationService {
    private readonly logger = new Logger(FinalizationService.name);

    constructor(
        private readonly mledbScrimService: MledbScrimService,
        private readonly mledbPlayerService: MledbPlayerService,
        private readonly mledbMatchService: MledbMatchService,
        private readonly ballchasingConverter: BallchasingConverterService,
        private readonly playerService: PlayerService,
        private readonly sprocketRatingService: SprocketRatingService,
        private readonly eloConnectorService: EloService,
        private readonly popService: PopulateService,
        @InjectConnection() private readonly dbConn: Connection,
        @InjectRepository(ScrimMeta) private readonly scrimMetaRepo: Repository<ScrimMeta>,
        @InjectRepository(MatchParent) private readonly matchParentRepo: Repository<MatchParent>,
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        @InjectRepository(Round) private readonly roundRepo: Repository<Round>,
        @InjectRepository(PlayerStatLine) private readonly playerStatRepo: Repository<PlayerStatLine>,
        @InjectRepository(TeamStatLine) private readonly teamStatRepo: Repository<TeamStatLine>,
        @InjectRepository(EligibilityData) private readonly eligibilityDataRepo: Repository<EligibilityData>,
    ) {}

    async saveScrimToDatabase(submission: ReplaySubmission, submissionId: string, scrim: Scrim): Promise<SaveScrimFinalizationReturn> {
        const runner = this.dbConn.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        const scrimMeta = this.scrimMetaRepo.create();
        const matchParent = this.matchParentRepo.create();

        // Relate them
        matchParent.scrimMeta = scrimMeta;
        scrimMeta.parent = matchParent;

        await runner.manager.save(matchParent);
        await runner.manager.save(scrimMeta);

        try {
            const [mledbScrim] = await Promise.all([
                this.mledbScrimService.saveScrim(submission, submissionId, runner, scrim),
                this.saveMatch(submission, runner, scrim.players.map(p => p.id), scrim.organizationId, matchParent),
            ]);

            await runner.commitTransaction();

            return {
                scrim: scrimMeta,
                legacyScrim: mledbScrim,

            };
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        }
    }

    async saveMatchToDatabase(submission: ReplaySubmission, submissionId: string, match: Match): Promise<void> {
        const runner = this.dbConn.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        const matchParent = await this.getMatchParentForMatch(runner, match);

        const playerLookupFn = async (p: BallchasingPlayer): Promise<User> => this.mledbPlayerService.getSprocketUserByPlatformInformation(p.id.platform.toUpperCase() as MLE_Platform, p.id.id);

        const users: User[] = await Promise.all(submission.items.flatMap(async item => {
            const ballchasingData = item.progress!.result!.data;
            return Promise.all([
                ...ballchasingData.blue.players.map(playerLookupFn),
                ...ballchasingData.orange.players.map(playerLookupFn),
            ]);
        })).then(flatten);

        try {
            if (!match.skillGroup) {
                match.skillGroup = await this.popService.populateOneOrFail(Match, match, "skillGroup");
            }
            if (!match.skillGroup.profile) {
                const skillGroupProfile = await this.popService.populateOneOrFail(GameSkillGroup, match.skillGroup, "profile");
                match.skillGroup.profile = skillGroupProfile;
            }

            const fixture = await this.popService.populateOne(MatchParent, matchParent, "fixture");
            if (!fixture) {
                throw new Error("Fixture not found, this may not be league play!");
            }
            const awayFranchise = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "awayFranchise");
            const homeFranchise = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "homeFranchise");

            const awayFranchiseProfile = await this.popService.populateOneOrFail(Franchise, awayFranchise, "profile");
            const homeFranchiseProfile = await this.popService.populateOneOrFail(Franchise, homeFranchise, "profile");

            const week = await this.popService.populateOneOrFail(ScheduleFixture, fixture, "scheduleGroup");
            const season = await this.popService.populateOneOrFail(ScheduleGroup, week, "parentGroup");

            const gameMode = await this.popService.populateOneOrFail(Match, match, "gameMode");

            const mleMatch = await this.mledbMatchService.getMleSeries(
                awayFranchiseProfile.title,
                homeFranchiseProfile.title,
                week.start,
                season.start,
                gameMode.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD,
                match.skillGroup.profile.code.toUpperCase() as League,
            );

            const [mledbSeriesId] = await Promise.all([
                this.mledbScrimService.saveMatch(submission, submissionId, runner, mleMatch),
                this.saveMatch(submission, runner, users.map(u => u.id), match.skillGroup.organizationId, matchParent),
            ]);
            this.logger.log(mledbSeriesId);
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        }

        this.logger.log("Successfully saved match!");
        await runner.rollbackTransaction();
    }

    async getMatchParentForMatch(runner: QueryRunner, match: Match): Promise<MatchParent> {
        return runner.manager.findOneOrFail(MatchParent, {
            where: {
                match: {id: match.id},
            },
            relations: ["match"],
        });
    }

    private async saveMatch(submission: ReplaySubmission, runner: QueryRunner, userIds: number[], organizationId: number, matchParent: MatchParent): Promise<Match> {
    // Create Scrim/MatchParent/Match for scrim
        const match = this.matchRepo.create();

        const parsedReplays = submission.items.map(i => i.progress!.result!);

        const playerStats: PlayerStatLine[] = [];
        const teamStats: TeamStatLine[] = [];

        const rounds = parsedReplays.map(pr => {
            switch (pr.parser) {
                case Parser.BALLCHASING: {
                    const round = this.roundRepo.create({
                        roundStats: this.ballchasingConverter.createRound(pr.data),
                        homeWon: false,
                        parser: pr.parser,
                        parserVersion: pr.parserVersion,
                        outputPath: pr.outputPath,
                    });

                    const createPlayerStat = (p: BallchasingPlayer, color: string): PlayerStatLine => {
                        const otherStats = this.ballchasingConverter.createPlayerStats(p);

                        return this.playerStatRepo.create({
                            isHome: color === "BLUE",
                            stats: {
                                otherStats,
                                ...this.sprocketRatingService.calcSprocketRating({
                                    ...p.stats.core,
                                    team_size: pr.data.team_size,
                                }),
                            },
                        });
                    };

                    const blueStats = pr.data.blue.players.map(p => createPlayerStat(p, "BLUE"));
                    const orangeStats = pr.data.orange.players.map(p => createPlayerStat(p, "ORANGE"));
                    const roundPlayerStats = [...orangeStats, ...blueStats];
                    roundPlayerStats.forEach(ps => {
                        ps.round = round;
                    });

                    // TODO: Handle linking a team for matches
                    const blueTeam = this.teamStatRepo.create({
                        stats: this.ballchasingConverter.createTeamStats(pr.data.blue),
                        teamName: "Blue",
                    });
                    blueTeam.round = round;
                    blueTeam.playerStats = blueStats;

                    const orangeTeam = this.teamStatRepo.create({
                        stats: this.ballchasingConverter.createTeamStats(pr.data.orange),
                        teamName: "Orange",
                    });
                    orangeTeam.round = round;
                    orangeTeam.playerStats = orangeStats;

                    blueStats.forEach(bs => {
                        bs.teamStats = blueTeam;
                    });
                    orangeStats.forEach(os => {
                        os.teamStats = orangeTeam;
                    });

                    const roundTeamStats = [blueTeam, orangeTeam];

                    playerStats.push(...roundPlayerStats);
                    teamStats.push(...roundTeamStats);
                    round.teamStats = roundTeamStats;
                    round.playerStats = roundPlayerStats;

                    return round;
                }
                default:
                    throw new Error(`Support for saving stats from ${pr.parser} is not supported`);
            }
        });

        const playerEligibilities: EligibilityData[] = await Promise.all(userIds.map(async userId => {
            const playerEligibility = this.eligibilityDataRepo.create();
            const player = await this.playerService.getPlayer({
                where: {
                    member: {
                        user: {
                            id: userId,
                        },
                        organization: {
                            id: organizationId,
                        },
                    },
                },
                relations: {
                    member: {
                        user: true,
                        organization: true,
                    },
                },
            });

            playerEligibility.player = player;
            playerEligibility.points = 5;

            return playerEligibility;
        }));

        // Create relationships
        matchParent.match = match;
        match.matchParent = matchParent;

        match.rounds = rounds;
        rounds.forEach(r => {
            r.gameMode = match.gameMode;
            r.match = match;
        });

        playerEligibilities.forEach(pe => {
            pe.matchParent = matchParent;
        });

        /*
         * The order of saving is important here
         * We first save the match parent, and then scrim meta, because scrim meta is the owner of the relationship.
        */
        await runner.manager.save(match);
        await runner.manager.save(rounds);
        await runner.manager.save(teamStats);
        await runner.manager.save(playerStats);
        await runner.manager.save(playerEligibilities);
        return match;
    }
}
