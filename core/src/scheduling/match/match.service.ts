import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {
    BallchasingPlayer, CoreEndpoint, CoreOutput,
} from "@sprocketbot/common";
import type {FindOneOptions, FindOptionsRelations} from "typeorm";
import {
    DataSource, IsNull, Not, Repository,
} from "typeorm";

import type {
    ScheduledEvent,
    ScrimMeta,
} from "../../database";
import {
    Franchise,
    Invalidation,
    Match,
    PlayerStatLineStatsSchema,
    Round,
    ScheduleFixture,
    Team,
} from "../../database";
import type {
    CalculateEloForMatchInput, MatchSummary, PlayerSummary,
} from "../../elo/elo-connector";
import {
    EloConnectorService, EloEndpoint, GameMode, TeamColor,
} from "../../elo/elo-connector";
import {PopulateService} from "../../util/populate/populate.service";

export type MatchParentResponse = {
    type: "fixture";
    data: ScheduleFixture;
} | {
    type: "scrim";
    data: ScrimMeta;
} | {
    type: "event";
    data: ScheduledEvent;
};

@Injectable()
export class MatchService {
    private readonly logger = new Logger(MatchService.name);

    constructor(
        @InjectRepository(Match) private matchRepository: Repository<Match>,
        @InjectRepository(Invalidation) private invalidationRepository: Repository<Invalidation>,
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
        private dataSource: DataSource,
        private readonly popService: PopulateService,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    async createMatch(isDummy?: boolean, invalidationId?: number): Promise<Match> {
        let invalidation: Invalidation | undefined;
        if (invalidationId) invalidation = await this.invalidationRepository.findOneOrFail({where: {id: invalidationId} });

        const match = this.matchRepository.create({
            isDummy: isDummy,
            invalidation: invalidation,
            rounds: [],
        });

        return this.matchRepository.save(match);
    }

    async getMatchBySubmissionId(submissionId: string): Promise<Match> {
        return this.matchRepository.findOneOrFail({
            where: {
                submissionId: submissionId,
            },
        });
    }

    async getMatchById(matchId: number, relations?: FindOptionsRelations<Match>): Promise<Match> {
        return this.matchRepository.findOneOrFail({where: {id: matchId}, relations: relations});
    }

    async getMatch(query: FindOneOptions<Match>): Promise<Match> {
        return this.matchRepository.findOneOrFail(query);
    }

    async getMatchParentEntity(matchId: number): Promise<MatchParentResponse> {
        const populatedMatch = await this.matchRepository.findOneOrFail({
            where: {
                id: matchId,
            },
            relations: ["matchParent", "matchParent.fixture", "matchParent.scrimMeta", "matchParent.event"],
        });

        if (populatedMatch.matchParent.fixture) {
            this.logger.debug("Populating Fixture");
            populatedMatch.matchParent.fixture.homeFranchise = await this.popService.populateOneOrFail(ScheduleFixture, populatedMatch.matchParent.fixture, "homeFranchise");
            populatedMatch.matchParent.fixture.homeFranchise.profile = await this.popService.populateOneOrFail(Franchise, populatedMatch.matchParent.fixture.homeFranchise, "profile");
            populatedMatch.matchParent.fixture.homeFranchiseId = populatedMatch.matchParent.fixture.homeFranchise.id;

            populatedMatch.matchParent.fixture.awayFranchise = await this.popService.populateOneOrFail(ScheduleFixture, populatedMatch.matchParent.fixture, "awayFranchise");
            populatedMatch.matchParent.fixture.awayFranchise.profile = await this.popService.populateOneOrFail(Franchise, populatedMatch.matchParent.fixture.awayFranchise, "profile");
            populatedMatch.matchParent.fixture.awayFranchiseId = populatedMatch.matchParent.fixture.awayFranchise.id;
            return {
                type: "fixture",
                data: populatedMatch.matchParent.fixture,
            };
        }
        if (populatedMatch.matchParent.scrimMeta) return {
            type: "scrim",
            data: populatedMatch.matchParent.scrimMeta,
        };
        if (populatedMatch.matchParent.event) return {
            type: "event",
            data: populatedMatch.matchParent.event,
        };
        throw new Error("Data type not found");
    }

    async resubmitAllMatchesAfter(startDate: Date): Promise<void> {
        const queryString = `WITH round_played_time AS (SELECT r.id,
                                  r."matchId",
                                  (r."roundStats" -> 'date')::TEXT::TIMESTAMP AS played_at
                               FROM round r)
                            SELECT "matchId",
                                   TO_TIMESTAMP(MIN(EXTRACT(EPOCH FROM played_at))),
                                   mp."fixtureId" IS NOT NULL AND mp."scrimMetaId" IS NULL AS is_league_match,
                                   mp."fixtureId" IS NULL AND mp."scrimMetaId" IS NULL     AS broken
                                FROM round_played_time
                                         INNER JOIN match m ON "matchId" = m.id
                                         INNER JOIN match_parent mp ON m."matchParentId" = mp.id
                                WHERE played_at > $1
                                GROUP BY "matchId", mp.id, m.id
                                ORDER BY 2;`;

        interface toBeReprocessed {id: number; date: string; is_league_match: boolean;}
        const results: toBeReprocessed[] = await this.dataSource.manager.query(queryString, [startDate]) as toBeReprocessed[];

        for (const r of results) {
            const payload = await this.translatePayload(r.id, r.is_league_match);
            await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForMatch, payload);
        }
    }

    async getMatchReportCardWebhooks(matchId: number): Promise<CoreOutput<CoreEndpoint.GetMatchReportCardWebhooks>> {
        const match = await this.matchRepository.findOneOrFail({
            where: {id: matchId},
            relations: {
                skillGroup: {
                    profile: true,
                },
                matchParent: {
                    fixture: {
                        homeFranchise: {
                            profile: true,
                        },
                        awayFranchise: {
                            profile: true,
                        },
                        scheduleGroup: {
                            type: {
                                organization: true,
                            },
                        },
                    },
                },
            },
        });

        if (!match.matchParent.fixture) throw new Error(`Match is not league match matchId=${matchId}`);
        return {
            skillGroupWebhook: match.skillGroup.profile.matchReportWebhookUrl,
            franchiseWebhooks: [
                match.matchParent.fixture.homeFranchise.profile.matchReportWebhookUrl,
                match.matchParent.fixture.awayFranchise.profile.matchReportWebhookUrl,
            ].filter(f => f) as string[],
            organizationId: match.matchParent.fixture.scheduleGroup.type.organization.id,
        };
    }

    async getFranchisesForMatch(matchId: number): Promise<{home: Franchise; away: Franchise;}> {
        const match = await this.matchRepository.findOneOrFail({
            where: {
                id: matchId,
                matchParent: {
                    fixture: Not(IsNull()),
                },
            },
            relations: {
                matchParent: {
                    fixture: {
                        homeFranchise: {profile: true},
                        awayFranchise: {profile: true},
                    },
                },
            },
        });
        return {
            home: match.matchParent.fixture!.homeFranchise,
            away: match.matchParent.fixture!.awayFranchise,
        };
    }

    /**
     * Marks replays as NCP=true/false, and updates the associated Elo of those replays and all connected replays accordingly.
     * "Connected" replays are where replays in which one of the player's in the NCP replay has played. Since the NCP replay will have its elo affects removed,
     * all subsequent replays where those player's played need to be recalculated.
     * @param replayId The replay to mark NCP=true/false.
     * @param isNcp Whether the given replayId should be marked NCP or un-NCP.
     * @returns A string containing status of what was updated.
     */
    async markReplaysNcp(replayIds: number[], isNcp: boolean, winningTeamInput?: Team, invalidation?: Invalidation): Promise<string> {
        const r = Math.floor(Math.random() * 10000);
        this.logger.verbose(`(${r}) begin markReplaysNcp: replayIds=${replayIds}, isNcp=${isNcp}, winningTeam=${winningTeamInput}`);

        // Find the winning team and it's franchise profile, since that's where
        // team names are in Sprocket.
        const winningTeam = await this.teamRepository.findOne({where: {id: winningTeamInput?.id}, relations: {franchise: {profile: true} } });

        if (isNcp && !winningTeam) return "Winning team must be specified if NCPing replays";

        // Make sure we are considering replayIds in chronological order
        replayIds.sort((r1, r2) => r1 - r2);

        // Gather replays
        const replayPromises = replayIds.map(async rId => this.roundRepository.findOneOrFail({where: {id: rId} }));
        const replays = await Promise.all(replayPromises);

        // Check to make sure the winning team played in each replay
        if (winningTeam) {
            for (const replay of replays) {
                if (replay.isDummy) continue; // Don't need to check dummy replays
                const teamsInReplay = replay.teamStats.map(tsl => tsl.teamName);
                if (!teamsInReplay.includes(winningTeam.franchise.profile.title)) {
                    this.logger.error(`The team \`${winningTeam.franchise.profile.title}\` did not play in replay with id \`${replay.id}\` (${teamsInReplay.join(" v. ")}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`);
                    this.logger.warn(`Could not find team=${winningTeam.franchise.profile.title} on replay with id=${replay.id}, cannot mark as NCP`);
                    throw new Error(`Could not find team=${winningTeam.franchise.profile.title} on replay with id=${replay.id}, cannot mark as NCP`);
                }
            }
        }

        // Set replays to NCP true/false and update winning team/color
        for (const replay of replays) {
            if (!isNcp && replay.isDummy) await this.roundRepository.delete(replay.id);

            replay.invalidation = invalidation;
            await this.roundRepository.save(replay);
        }

        // Magic happens here to talk to the ELO service
        const noDummies = replays.filter(rep => !rep.isDummy).map(rep => rep.id);
        await this.eloConnectorService.createJob(EloEndpoint.CalculateEloForNcp, {
            roundIds: noDummies,
            isNcp: isNcp,
        });

        const outStr = `\`${replayIds.length === 1
            ? `replayId=${replayIds[0]}`
            : `replayIds=[${replayIds.join(", ")}]`
        }\` successfully marked \`ncp=${isNcp}\`, ${winningTeam
            ? `\`winningTeam=${winningTeam.franchise.profile.title}\``
            : ""
        } with updated elo, and all connected replays had their elo updated.`;

        return outStr;
    }

    async translatePayload(matchId: number, isScrim: boolean): Promise<CalculateEloForMatchInput> {
        const match = await this.matchRepository.findOneOrFail({
            where: {id: matchId},
            relations: {rounds: {teamStats: {playerStats: {player: true} } }, gameMode: true},
        });

        const payload: CalculateEloForMatchInput = {
            id: match.id,
            numGames: match.rounds.length,
            isScrim: isScrim,
            gameMode: (match.gameMode.code === "RL_DOUBLES") ? GameMode.DOUBLES : GameMode.STANDARD,
            gameStats: [],
        };

        for (const round of match.rounds) {
            const orangeStats = round.teamStats[1].playerStats.map(p => PlayerStatLineStatsSchema.safeParse(p.stats));
            const blueStats = round.teamStats[0].playerStats.map(p => PlayerStatLineStatsSchema.safeParse(p.stats));

            const orangeStatsResults: BallchasingPlayer[] = [];
            const blueStatsResults: BallchasingPlayer[] = [];

            const errors: Error[] = [];

            orangeStats.forEach(stat => {
                if (stat.success) orangeStatsResults.push(stat.data.otherStats);
                else errors.push(stat.error);
            });

            blueStats.forEach(stat => {
                if (stat.success) blueStatsResults.push(stat.data.otherStats);
                else errors.push(stat.error);
            });

            if (errors.length) {
                throw new Error("Failed to convert");
            }

            const summary: MatchSummary = {
                id: round.id,
                orangeWon: !round.homeWon,
                scoreOrange: orangeStatsResults.reduce((sum, p) => sum + p.stats.core.goals, 0),
                scoreBlue: blueStatsResults.reduce((sum, p) => sum + p.stats.core.goals, 0),
                blue: round.teamStats[0].playerStats.map((p, i) => this.translatePlayerStats(p.player.id, blueStatsResults[i], TeamColor.BLUE)),
                orange: round.teamStats[1].playerStats.map((p, i) => this.translatePlayerStats(p.player.id, orangeStatsResults[i], TeamColor.ORANGE)),
            };

            payload.gameStats?.push(summary);
        }

        return payload;
    }

    translatePlayerStats(playerId: number, bcPlayer: BallchasingPlayer, team: TeamColor): PlayerSummary {
        return {
            id: playerId,
            name: "",
            team: team,
            mvpr: this.calculateMVPR(bcPlayer),
        } as PlayerSummary;
    }

    calculateMVPR(p: BallchasingPlayer): number {
        return p.stats.core.goals + (p.stats.core.assists * 0.75) + (p.stats.core.saves * 0.60) + (p.stats.core.shots / 3);
    }

    /**
     * Marks a series (with either a fixture or scrim) as full_ncp=true/false, marks all associated replays as ncp=true, and updates the associated Elo of those replays and all connected replays accordingly.
     * "Connected" replays are where replays in which one of the player's in the NCP replay has played. Since the NCP replay will have its elo affects removed,
     * all subsequent replays where those player's played need to be recalculated.
     * @param seriesId The series to mark full_ncp=true/false.
     * @param isNcp Whether the given replayId should be marked NCP or un-NCP.
     * @param progressMessage A message to update with the progress of the NCP processing.
     * @param seriesType Whether the series is a fixture or scrim series, used for input validation and for difference in actions between fixtures/scrims.
     * @param winningTeam The team that should win the NCP. Required if seriesType=Fixture and isNcp=true.
     * @param numReplays The number of replays that should be in the series. Optional. Used to add dummy replays in place of replays that weren't submitted for some reason.
     * @returns A string containing a summary of the actions that took place when the processing has completed.
     */
    async markSeriesNcp(seriesId: number, isNcp: boolean, winningTeamId?: number, numReplays?: number): Promise<string> {
        const r = Math.floor(Math.random() * 10000);
        this.logger.verbose(`(${r}) begin markSeriesNcp: seriesId=${seriesId}, isNcp=${isNcp}, winningTeam=${winningTeamId}`);

        // Find the winning team and it's franchise profile, since that's where
        // team names are in Sprocket.
        const winningTeam = await this.teamRepository.findOne({where: {id: winningTeamId}, relations: {franchise: {profile: true} } });
        const series = await this.matchRepository.findOneOrFail({
            where: {id: seriesId},
            relations: {
                matchParent: {
                    fixture: {
                        homeFranchise: true,
                        awayFranchise: true,
                    },
                    scrimMeta: true,
                },
                rounds: true,
            },
        });

        if (series.matchParent.fixture) {
            // Winning team must be specified if NCPing replays
            if (isNcp && !winningTeam) {
                throw new Error("When NCPing a series associated with a fixture, you must specify a winningTeam");
            }

            // Check to make sure the winning team played in the series/fixture
            if (winningTeam
                && series.matchParent.fixture.homeFranchise !== winningTeam.franchise
                && series.matchParent.fixture.awayFranchise !== winningTeam.franchise) {
                throw new Error(`The team \`${winningTeam?.franchise.profile.title}\` did not play in series with id \`${series.id}\` (${series.matchParent.fixture.awayFranchise.profile.title} v. ${series.matchParent.fixture.homeFranchise.profile.title}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`);
            }
        } else if (!series.matchParent.scrimMeta) {
            throw new Error(`MarkSeriesNCP called with series without a fixtureId or scrimMetaId`);
        }

        const seriesReplays: Round[] = series.rounds;

        // Add dummy replays
        let dummiesNeeded: number = 0;
        if (numReplays) {
            dummiesNeeded = numReplays - seriesReplays.length;
            for (let i = 0;i < dummiesNeeded;i++) {
                const dummy: Partial<Round> = {
                    isDummy: true,
                    match: series,
                    playerStats: [],
                    teamStats: [],
                    roundStats: "",
                    homeWon: false,
                };

                const result = this.roundRepository.create(dummy);
                seriesReplays.push(result);
            }
        }

        const invalidation = this.invalidationRepository.create({
            favorsHomeTeam: winningTeamId === series.matchParent.fixture?.homeFranchise.id,
            description: series.matchParent.fixture ? "Series NCP" : "Scrim NCP",
        });
        await this.invalidationRepository.save(invalidation);

        series.invalidation = invalidation;
        await this.matchRepository.save(series);

        // Update each series replay (including any dummies) to NCP
        const replayIds = seriesReplays.map(replay => replay.id);
        await this.markReplaysNcp(replayIds, isNcp, winningTeam ?? undefined, invalidation);

        this.logger.verbose(`(${r}) end markSeriesNcp`);

        const seriesTypeStr = series.matchParent.fixture ? "fixture" : series.matchParent.scrimMeta ? "scrim" : "unknown";
        return `\`seriesId=${seriesId}\` ${seriesTypeStr ? `(${seriesTypeStr})` : ""} successfully marked \`fullNcp=${isNcp}\` with updated elo, and all connected replays had their elo updated.${numReplays && dummiesNeeded ? ` **${dummiesNeeded} dummy replay(s)** were added to the series.` : ""}`;
    }
}
