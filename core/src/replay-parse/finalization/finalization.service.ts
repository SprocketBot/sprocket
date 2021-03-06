import {Injectable, Logger} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, Scrim, ScrimDatabaseIds,
} from "@sprocketbot/common";
import {
    CeleryService,
    Parser,
    RedisService,
} from "@sprocketbot/common";
import type {QueryRunner} from "typeorm";
import {Connection, Repository} from "typeorm";

import {
    EligibilityData,
    Match,
    MatchParent,
    PlayerStatLine,
    Round,
    ScrimMeta,
    TeamStatLine,
} from "../../database";
import {PlayerService} from "../../franchise";
import {MledbScrimService} from "../../mledb/mledb-scrim/mledb-scrim.service";
import {SprocketRatingService} from "../../sprocket-rating/sprocket-rating.service";
import type {ReplaySubmission} from "../types";
import {BallchasingConverterService} from "./ballchasing-converter";

@Injectable()
export class FinalizationService {
    private readonly logger = new Logger(FinalizationService.name);

    constructor(
        private readonly celeryService: CeleryService,
        private readonly redisService: RedisService,
        private readonly mledbScrimService: MledbScrimService,
        private readonly ballchasingConverter: BallchasingConverterService,
        private readonly playerService: PlayerService,
        private readonly sprocketRatingService: SprocketRatingService,
        @InjectConnection() private readonly dbConn: Connection,
        @InjectRepository(ScrimMeta) private readonly scrimMetaRepo: Repository<ScrimMeta>,
        @InjectRepository(MatchParent) private readonly matchParentRepo: Repository<MatchParent>,
        @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
        @InjectRepository(Round) private readonly roundRepo: Repository<Round>,
        @InjectRepository(PlayerStatLine) private readonly playerStatRepo: Repository<PlayerStatLine>,
        @InjectRepository(TeamStatLine) private readonly teamStatRepo: Repository<TeamStatLine>,
        @InjectRepository(EligibilityData) private readonly eligibilityDataRepo: Repository<EligibilityData>,
    ) {
    }

    async saveScrimToDatabase(submission: ReplaySubmission, submissionId: string, scrim: Scrim): Promise<ScrimDatabaseIds> {
        const runner = this.dbConn.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        try {
            const [mledbScrimId, sprocketMatchParentId] = await Promise.all([
                this.mledbScrimService.saveScrim(submission, submissionId, runner, scrim),
                this.saveToSprocket(submission, runner, scrim),
            ]);

            await runner.commitTransaction();

            return {
                id: sprocketMatchParentId,
                legacyId: mledbScrimId,
            };
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        }
    }

    private async saveToSprocket(submission: ReplaySubmission, runner: QueryRunner, scrimObject: Scrim): Promise<number> {
        // Create Scrim/MatchParent/Match for scrim
        const scrimMeta = this.scrimMetaRepo.create();
        const matchParent = this.matchParentRepo.create();
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
                    });

                    const createPlayerStat = (p: BallchasingPlayer, color: string): PlayerStatLine => {
                        const otherStats = this.ballchasingConverter.createPlayerStats(p);

                        return this.playerStatRepo.create({
                            isHome: color === "BLUE",
                            stats: {otherStats, ...this.sprocketRatingService.calcSprocketRating({...p.stats.core, team_size: pr.data.team_size})},
                        });
                    };

                    const blueStats = pr.data.blue.players.map(p => createPlayerStat(p, "BLUE"));
                    const orangeStats = pr.data.orange.players.map(p => createPlayerStat(p, "ORANGE"));
                    const roundPlayerStats = [...orangeStats, ...blueStats];
                    roundPlayerStats.forEach(ps => { ps.round = round });

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

                    blueStats.forEach(bs => { bs.teamStats = blueTeam });
                    orangeStats.forEach(os => { os.teamStats = orangeTeam });

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

        const playerEligibilities: EligibilityData[] = await Promise.all(scrimObject.players.map(async p => {
            const playerEligibility = this.eligibilityDataRepo.create();
            const player = await this.playerService.getPlayer({
                where: {
                    member: {
                        user: {
                            id: p.id,
                        },
                        organization: {
                            id: scrimObject.organizationId,
                        },
                    },
                },
                relations: [
                    "member",
                    "member.user",
                    "member.organization",
                ],
            });

            playerEligibility.player = player;
            playerEligibility.points = 5;

            return playerEligibility;
        }));

        // Create relationships
        matchParent.scrimMeta = scrimMeta;
        scrimMeta.parent = matchParent;

        matchParent.match = match;
        match.matchParent = matchParent;

        match.rounds = rounds;
        rounds.forEach(r => { r.match = match });

        playerEligibilities.forEach(pe => { pe.matchParent = matchParent });

        /*
         * The order of saving is important here
         * We first save the match parent, and then scrim meta, because scrim meta is the owner of the relationship.
         */
        await runner.manager.save(matchParent);
        await runner.manager.save(scrimMeta);
        await runner.manager.save(match);
        await runner.manager.save(rounds);
        await runner.manager.save(teamStats);
        await runner.manager.save(playerStats);
        await runner.manager.save(playerEligibilities);

        return scrimMeta.id;
    }
}
