import {Injectable, Logger} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, BallchasingResponse, BallchasingTeam, Scrim,
} from "@sprocketbot/common";
import {
    BallchasingResponseSchema, Parser, ProgressStatus,
} from "@sprocketbot/common";
import type {EntityManager} from "typeorm";
import {DataSource} from "typeorm";
import type {QueryDeepPartialEntity} from "typeorm/query-builder/QueryPartialEntity";

import type {Player, Team} from "../../../database";
import {
    EligibilityData, GameMode, Match, MatchParent, PlayerStatLine, Round, ScrimMeta, TeamStatLine,
} from "../../../database";
import {PlayerService} from "../../../franchise";
import {TeamService} from "../../../franchise/team/team.service";
import {MledbFinalizationService, MledbPlayerService} from "../../../mledb";
import {MatchService} from "../../../scheduling";
import {SprocketRatingService} from "../../../sprocket-rating/sprocket-rating.service";
import type {SprocketRating, SprocketRatingInput} from "../../../sprocket-rating/sprocket-rating.types";
import type {
    MatchReplaySubmission, ReplaySubmission, ScrimReplaySubmission,
} from "../../types";
import {ReplaySubmissionType} from "../../types";
import {BallchasingConverterService} from "../ballchasing-converter";
import type {SaveMatchFinalizationReturn, SaveScrimFinalizationReturn} from "../finalization.types";

@Injectable()
export class RocketLeagueFinalizationService {

    private readonly logger = new Logger(RocketLeagueFinalizationService.name);

    constructor(
        private readonly playerService: PlayerService,
        private readonly matchService: MatchService,
        private readonly sprocketRatingService: SprocketRatingService,
        private readonly mledbPlayerService: MledbPlayerService,
        private readonly teamService: TeamService,
        private readonly ballchasingConverter: BallchasingConverterService,
        private readonly mledbFinalizationService: MledbFinalizationService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    async finalizeScrim(submission: ScrimReplaySubmission, scrim: Scrim): Promise<SaveScrimFinalizationReturn> {
        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();
        const em = qr.manager;
        try {
            const gameMode = await em.findOneByOrFail(GameMode, {id: scrim.gameModeId});

            const scrimMeta = em.create(ScrimMeta);
            const matchParent = em.create(MatchParent);
            const match = em.create(Match);
            await em.insert(ScrimMeta, scrimMeta as QueryDeepPartialEntity<ScrimMeta>);
            matchParent.scrimMeta = scrimMeta;

            await em.insert(MatchParent, matchParent as QueryDeepPartialEntity<MatchParent>);
            match.matchParent = matchParent;
            match.skillGroupId = scrim.skillGroupId;
            match.gameMode = gameMode;

            await em.insert(Match, match as QueryDeepPartialEntity<Match>);
            await this.saveMatchDependents(submission, scrim.organizationId, match, true, em);

            const mledbScrim = await this.mledbFinalizationService.saveScrim(submission, submission.id, em, scrim);

            // Fix up these relationships
            scrimMeta.parent = matchParent;
            matchParent.match = match;
            await qr.commitTransaction();

            return {scrim: scrimMeta, legacyScrim: mledbScrim};
        } catch (e) {
            const errorPayload = {
                submissionId: submission.id,
                scrim: scrim.id,
            };

            this.logger.error(`Failed to save scrim! ${(e as Error).message} | ${JSON.stringify(errorPayload)}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    async finalizeMatch(submission: MatchReplaySubmission): Promise<SaveMatchFinalizationReturn> {
        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();
        const em = qr.manager;
        try {
            const match = await this.matchService.getMatchById(submission.matchId, {matchParent: {fixture: {homeFranchise: {organization: true} } }, gameMode: true});
            const organization = match.matchParent.fixture!.homeFranchise.organization;

            await this.saveMatchDependents(submission, organization.id, match, false, em);

            const mleMatch = await this.mledbFinalizationService.saveMatch(submission, submission.id, em);
            await qr.commitTransaction();
            return {match: match, legacyMatch: mleMatch};
        } catch (e) {
            const errorPayload = {
                submissionId: submission.id,
                matchId: submission.matchId,
            };

            this.logger.error(`Failed to save match! ${(e as Error).message} | ${JSON.stringify(errorPayload)}`);
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }

    }

    /**
     * Saves objects that depend on the Match (i.e. Rounds, Player Stats, Team Stats)
     */
    async saveMatchDependents(submission: ReplaySubmission, organizationId: number, match: Match, eligibility: boolean, em: EntityManager): Promise<Match> {
        if (submission.items.some(i => i.progress?.status !== ProgressStatus.Complete)) {
            throw new Error(`Not all items have been completed. Finalization attempted too soon. ${JSON.stringify({submissionId: submission.id, match: match.id})}`);
        }

        const replays = submission.items.map<{replay: BallchasingResponse; parser: {type: Parser; version: number;}; outputPath: string;}>(i => {
            const r = BallchasingResponseSchema.safeParse(i.progress?.result?.data);

            if (!r.success) {
                throw new Error(`${i.originalFilename} does not contain expected values. ${JSON.stringify(r.error.errors.map(e => e.message))}`);
            }

            if (i.progress?.result?.parser !== Parser.BALLCHASING) {
                throw new Error(`Saving matches with a non-ballchasing parser is not supported. found ${i.progress?.result?.parser}`);
            }

            return {
                replay: r.data, parser: {type: i.progress.result.parser, version: i.progress.result.parserVersion}, outputPath: i.outputPath!,
            };
        });

        const isMatch = submission.type === ReplaySubmissionType.MATCH;
        const {home, away} = isMatch ? await this.matchService.getFranchisesForMatch(match.id) : {home: undefined, away: undefined};
        const [homeTeam, awayTeam] = isMatch
            ? await Promise.all([
                await this.teamService.getTeam(home!.id, match.skillGroupId),
                await this.teamService.getTeam(away!.id, match.skillGroupId),
            ])
            : [undefined, undefined];

        // TODO: Sprocket Team Role Usage
        const results = await Promise.all(replays.map(async ({
            replay, parser, outputPath,
        }) => {
            // Get players
            const {blue, orange} = await this._getBallchasingPlayers(replay);
            /*
             First, identify which team is home.
             It is safe to assume that all players are on the same team here;
             This is because the validation service has passed these over.

             We are using MLE Teams right now because Sprocket Roster can't be trusted.
             TODO: R2 Update this
            */

            let awayColor: "blue" | "orange",
                blueTeam: Team | undefined,
                blueTeamName: string,
                homeColor: "blue" | "orange",
                orangeTeam: Team | undefined,
                orangeTeamName: string;
            if (isMatch) {
                const blueCaptain = blue[0].player;
                const orangeCaptain = orange[0].player;
                const [blueMle, orangeMle] = await Promise.all([
                    this.mledbPlayerService.getMlePlayerBySprocketUser(blueCaptain.member.userId),
                    this.mledbPlayerService.getMlePlayerBySprocketUser(orangeCaptain.member.userId),
                ]);
                /*
                 * Now we have the team names; so we'll need to look up the fixture.
                 */
                blueTeamName = blueMle.teamName;
                orangeTeamName = orangeMle.teamName;
                /*
                 * Identify which team is home; and which is away
                 */
                homeColor = blueTeamName === home!.profile.title ? "blue" : "orange";
                awayColor = blueTeamName === home!.profile.title ? "orange" : "blue";
                blueTeam = homeColor === "blue" ? homeTeam : awayTeam;
                orangeTeam = homeColor === "orange" ? homeTeam : awayTeam;

            } else {
                // It's a scrim!
                homeColor = "blue";
                awayColor = "orange";
                blueTeamName = "Blue Team";
                orangeTeamName = "Orange Team";
            }
            const homeWon = replay[homeColor].stats.core.goals > replay[awayColor].stats.core.goals;
            /*
             * Create the round
             */
            const round = this._createRound(match, homeWon, replay, parser, outputPath);

            /*
             * Create player and team stat lines
             */
            const blueTeamStats = await this._createTeamStatLine(replay.blue, round, blueTeamName, em, blueTeam);
            const bluePlayers = await Promise.all(blue.map(async bp => this._createPlayerStatLine(bp.rawPlayer, bp.player, replay.orange, blueTeamStats, match.gameMode, homeColor === "blue", round, em)));
            const orangeTeamStats = await this._createTeamStatLine(replay.orange, round, orangeTeamName, em, orangeTeam);
            const orangePlayers = await Promise.all(orange.map(async op => this._createPlayerStatLine(op.rawPlayer, op.player, replay.orange, orangeTeamStats, match.gameMode, homeColor === "orange", round, em)));

            // We save the round first; because it does not have the join columns
            await em.insert(Round, round as QueryDeepPartialEntity<Round>);
            await em.insert(TeamStatLine, blueTeamStats as QueryDeepPartialEntity<TeamStatLine>);
            await em.insert(TeamStatLine, orangeTeamStats as QueryDeepPartialEntity<TeamStatLine>);
            await em.insert(PlayerStatLine, bluePlayers as QueryDeepPartialEntity<PlayerStatLine>);
            await em.insert(PlayerStatLine, orangePlayers as QueryDeepPartialEntity<PlayerStatLine>);

            if (eligibility) {
                const eligibilities = [...blue.map(b => b.player), ...orange.map(o => o.player)].map(p => this._createEligibility(p, match.matchParent, em, submission.items.length));
                await em.insert(EligibilityData, eligibilities as QueryDeepPartialEntity<EligibilityData>);
            }

            round.teamStats = [blueTeamStats, orangeTeamStats];
            round.playerStats = [...bluePlayers, ...orangePlayers];

            return round;
        }));

        match.rounds = results;

        return match;
    }

    _createRound(match: Match, homeWon: boolean, replay: BallchasingResponse, parser: {type: Parser; version: number;}, outputPath: string): Round {
        const round = new Round();
        round.gameMode = match.gameMode;
        round.homeWon = homeWon;
        round.isDummy = false;
        round.roundStats = this.ballchasingConverter.createRound(replay);
        round.match = match;
        round.parser = parser.type;
        round.parserVersion = parser.version;
        round.outputPath = outputPath;

        return round;
    }

    /**
     * Looks up a set of players based on their ballchasing information
     * Noteworthy; this looks up sprocket players!
     */
    async _getBallchasingPlayers(ballchasing: BallchasingResponse): Promise<{blue: Array<{player: Player; rawPlayer: BallchasingPlayer;}>; orange: Array<{player: Player; rawPlayer: BallchasingPlayer;}>;}> {
        // TODO: This won't work when we support multiple games; in theory is an array of players for that member.
        const lookupFn = async (p: BallchasingPlayer): Promise<Player> => this.playerService.getPlayer({
            where: {
                member: {
                    platformAccounts: {
                        platformAccountId: p.id.id,
                        platform: {
                            code: p.id.platform.toUpperCase(),
                        },
                    },
                },
            },
            relations: {member: {platformAccounts: {platform: true} } },
        });

        const bluePlayerIds = new Array<BallchasingPlayer>();
        const orangePlayerIds = new Array<BallchasingPlayer>();

        ballchasing.blue.players.forEach(player => {
            if (!bluePlayerIds.some(p => p.id.id === player.id.id)) {
                bluePlayerIds.push(player);
            }
        });
        ballchasing.orange.players.forEach(player => {
            if (!orangePlayerIds.some(p => p.id.id === player.id.id)) {
                orangePlayerIds.push(player);
            }
        });

        return {
            blue: await Promise.all(bluePlayerIds.map(async p => ({player: await lookupFn(p), rawPlayer: p}))),
            orange: await Promise.all(orangePlayerIds.map(async p => ({player: await lookupFn(p), rawPlayer: p}))),
        };
    }

    async _createTeamStatLine(rawTeam: BallchasingTeam, round: Round, teamName: string, em: EntityManager, team?: Team): Promise<TeamStatLine> {
        const output = em.create(TeamStatLine);
        output.stats = {
            name: rawTeam.name,
            color: rawTeam.color,
            stats: rawTeam.stats,
        };
        output.team = team;
        output.round = round;
        output.teamName = teamName;
        return output;
    }

    _createEligibility(player: Player, matchParent: MatchParent, em: EntityManager, gameCount: number): EligibilityData {
        const output = em.create(EligibilityData);
        output.matchParent = matchParent;
        output.player = player;
        output.points = Math.floor(gameCount * 5 / 3);
        return output;
    }

    // TODO: Testing
    async _createPlayerStatLine(rawPlayer: BallchasingPlayer, player: Player, opposingTeam: BallchasingTeam, teamStats: TeamStatLine, gameMode: GameMode, isHome: boolean, round: Round, em: EntityManager): Promise<PlayerStatLine> {
        const output = em.create(PlayerStatLine);

        const sprocketRating = this._getSprocketRating(rawPlayer, opposingTeam, gameMode);

        output.teamStats = teamStats;
        output.player = player;
        output.stats = {
            otherStats: rawPlayer,
            ...sprocketRating,
        };
        output.isHome = isHome;
        output.round = round;
        return output;
    }

    // TODO: Testing
    _getSprocketRating(rawPlayer: BallchasingPlayer, opposingTeam: BallchasingTeam, gameMode: GameMode): SprocketRating {
        const sprocketRatingInput: SprocketRatingInput = {
            ...rawPlayer.stats.core,
            ...opposingTeam.players.reduce<{goals_against: number; shots_against: number;}>((acc, v) => {
                acc.goals_against += v.stats.core.goals;
                acc.shots_against += v.stats.core.shots;
                return acc;
            }, {goals_against: 0, shots_against: 0}),
            team_size: gameMode.teamSize,
        };
        return this.sprocketRatingService.calcSprocketRating(sprocketRatingInput);
    }
}

