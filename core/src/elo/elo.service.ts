import {InjectQueue} from "@nestjs/bull";
import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {BallchasingPlayer} from "@sprocketbot/common";
import {EventsService, EventTopic} from "@sprocketbot/common";
import {Queue} from "bull";
import {previousMonday} from "date-fns";
import {Repository} from "typeorm";

import type {MatchParent, PlayerStatLine} from "../database";
import {
    Invalidation, Match, Player, Round, Team,
} from "../database";
import {GameSkillGroupService, PlayerService} from "../franchise";
import {WEEKLY_SALARIES_JOB_NAME} from "./elo.consumer";
import {EloBullQueue, EloEndpoint} from "./elo-connector";
import {EloConnectorService} from "./elo-connector/elo-connector.service";
import type {
    CalculateEloForMatchInput, MatchSummary, PlayerSummary, SalaryPayloadItem,
} from "./elo-connector/schemas";
import {GameMode, TeamColor} from "./elo-connector/schemas";

@Injectable()
export class EloService {
    private readonly logger = new Logger(EloService.name);

    constructor(
        @InjectRepository(Player) private readonly playerRepository: Repository<Player>,
        @InjectRepository(Round) private readonly roundRepository: Repository<Round>,
        @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
        @InjectRepository(Match) private readonly matchRepository: Repository<Match>,
        @InjectRepository(Invalidation) private readonly invalidationRepository: Repository<Invalidation>,
        @InjectQueue(EloBullQueue) private eloQueue: Queue,
        private readonly eloConnectorService: EloConnectorService,
        private readonly playerService: PlayerService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const repeatableJobs = await this.eloQueue.getRepeatableJobs();

        if (!repeatableJobs.some(job => job.name === WEEKLY_SALARIES_JOB_NAME)) {
            this.logger.debug("Found no job for weekly salaries, creating");

            await this.eloQueue.add(WEEKLY_SALARIES_JOB_NAME, null, {
                repeat: {
                    cron: "0 12 * * 1",
                    startDate: previousMonday(new Date()),
                    tz: "America/New_York",
                },
            });
        } else {
            this.logger.debug("Job for weekly salaries already exists");
        }
    }

    async saveSalaries(payload: SalaryPayloadItem[][]): Promise<void> {
        await Promise.allSettled(payload.map(async payloadSkillGroup => Promise.allSettled(payloadSkillGroup.map(async playerDelta => {
            const player = await this.playerService.getPlayer({
                where: {id: playerDelta.playerId},
                relations: {
                    skillGroup: {
                        organization: true,
                        game: true,
                        profile: true,
                    },
                },
            });
            
            if (playerDelta.sgDelta === 0) await this.playerService.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);
            else if (playerDelta.sgDelta > 0) {
                const skillGroup = await this.skillGroupService.getGameSkillGroup({
                    where: {
                        game: {
                            id: player.skillGroup.game.id,
                        },
                        organization: {
                            id: player.skillGroup.organization.id,
                        },
                        ordinal: player.skillGroup.ordinal + playerDelta.sgDelta,
                        profile: true,
                    },
                });

                await this.playerService.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary, skillGroup.id);
                await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
                    oldSkillGroup: {
                        id: player.skillGroup.id,
                        ordinal: player.skillGroup.ordinal,
                        name: player.skillGroup.profile.description,
                    },
                    newSkillGroup: {
                        id: skillGroup.id,
                        ordinal: skillGroup.ordinal,
                        name: skillGroup.profile.description,
                    },
                });
            } else {
                // rank down, add a new input into redis for rankdown request
            }
        }))));
    }

    translatePayload(matchParent: MatchParent, isScrim: boolean): CalculateEloForMatchInput {
        const match = matchParent.match;
        const payload: CalculateEloForMatchInput = {
            id: match.id,
            numGames: match.rounds.length,
            isScrim: isScrim,
            gameMode: (matchParent.event?.gameMode?.teamSize === 2) ? GameMode.DOUBLES : GameMode.STANDARD,
            gameStats: [],
        };

        for (const round of match.rounds) {
            const orangeStats: BallchasingPlayer[] = (round.teamStats[1].playerStats.map(p => p.stats)) as BallchasingPlayer[];
            const blueStats: BallchasingPlayer[] = (round.teamStats[0].playerStats.map(p => p.stats)) as BallchasingPlayer[];
            const summary: MatchSummary = {
                id: round.id,
                orangeWon: !round.homeWon,
                scoreOrange: orangeStats.reduce((sum, p) => sum + p.stats.core.goals, 0),
                scoreBlue: blueStats.reduce((sum, p) => sum + p.stats.core.goals, 0),
                blue: round.teamStats[0].playerStats.map(p => this.translatePlayerStats(p, TeamColor.BLUE)),
                orange: round.teamStats[1].playerStats.map(p => this.translatePlayerStats(p, TeamColor.ORANGE)),
            };

            payload.gameStats?.push(summary);
        }

        return payload;
    }

    translatePlayerStats(p: PlayerStatLine, team: TeamColor): PlayerSummary {
        return {
            id: p.player.id,
            name: "",
            team: team,
            mvpr: this.calculateMVPR(p.stats as BallchasingPlayer),
        } as PlayerSummary;
    }

    calculateMVPR(p: BallchasingPlayer): number {
        return p.stats.core.goals + (p.stats.core.assists * 0.75) + (p.stats.core.saves * 0.60) + (p.stats.core.shots / 3);
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
