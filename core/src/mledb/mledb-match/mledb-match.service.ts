import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";
import type {FindOperator, FindOptionsRelations} from "typeorm";
import {Raw, Repository} from "typeorm";

import {Franchise} from "../../franchise/database/franchise.entity";
import {GameSkillGroup} from "../../franchise/database/game-skill-group.entity";
import {GameMode} from "../../game/database/game-mode.entity";
import {Match} from "../../scheduling/database/match.entity";
import {MatchRepository} from "../../scheduling/database/match.repository";
import {MatchParent} from "../../scheduling/database/match-parent.entity";
import {ScheduleFixture} from "../../scheduling/database/schedule-fixture.entity";
import {ScheduleGroup} from "../../scheduling/database/schedule-group.entity";
import {ScheduleGroupType} from "../../scheduling/database/schedule-group-type.entity";
import {PopulateService} from "../../util";
import type {League} from "../database";
import {LegacyGameMode, MLE_Fixture, MLE_Series, MLE_SeriesReplay, MLE_Team, MLE_TeamToCaptain} from "../database";

@Injectable()
export class MledbMatchService {
    private readonly logger = new Logger(MledbMatchService.name);

    constructor(
        @InjectRepository(MLE_Fixture) private readonly fixtureRepo: Repository<MLE_Fixture>,
        @InjectRepository(MLE_Team) private readonly teamRepo: Repository<MLE_Team>,
        @InjectRepository(MLE_Series) private readonly seriesRepo: Repository<MLE_Series>,
        @InjectRepository(MLE_SeriesReplay) private readonly seriesReplayRepo: Repository<MLE_SeriesReplay>,
        @InjectRepository(MLE_TeamToCaptain) private readonly teamCaptainRepo: Repository<MLE_TeamToCaptain>,
        private readonly sprocketMatchRepository: MatchRepository,
        private readonly popService: PopulateService,
    ) {}

    async getMleSeries(
        awayName: string,
        homeName: string,
        matchStart: Date,
        seasonStart: Date,
        mode: LegacyGameMode,
        league: League,
    ): Promise<MLE_Series> {
        const matchByDay: (d: Date) => FindOperator<Date> = (d: Date) =>
            Raw<Date>(
                (alias: string) => `DATE_TRUNC('day', ${alias}) = '${d.toISOString().split("T")[0]}'`,
            ) as unknown as FindOperator<Date>;

        const mleFixture = await this.fixtureRepo.findOneOrFail({
            where: {
                series: {
                    mode: mode,
                    league: league,
                },
                awayName: awayName,
                homeName: homeName,
                match: {
                    from: matchByDay(matchStart),
                    season: {
                        startDate: matchByDay(seasonStart),
                    },
                },
            },
            relations: {
                series: {
                    fixture: true,
                },
                match: {season: true},
            },
        });

        if (mleFixture.series.length !== 1) {
            throw new Error(
                `Found more than one series matching params ${JSON.stringify({
                    awayName,
                    homeName,
                    matchStart,
                    seasonStart,
                    mode,
                })}`,
            );
        }

        return mleFixture.series[0];
    }

    async getMleMatchInfoAndStakeholders(
        sprocketMatchId: number,
    ): Promise<CoreOutput<CoreEndpoint.GetMleMatchInfoAndStakeholders>> {
        const match = (await this.sprocketMatchRepository.findById(sprocketMatchId)) as Partial<Match>;
        if (!match.skillGroup) {
            match.skillGroup = await this.popService.populateOneOrFail(Match, match as Match, "skillGroup");
        }
        if (!(match.skillGroup as Partial<GameSkillGroup>).profile) {
            const skillGroupProfile = await this.popService.populateOneOrFail(
                GameSkillGroup,
                match.skillGroup,
                "profile",
            );
            match.skillGroup.profile = skillGroupProfile;
        }

        const matchParent = await this.popService.populateOneOrFail(Match, match as Match, "matchParent");

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
        const groupType = await this.popService.populateOneOrFail(ScheduleGroup, season, "type");
        const organization = await this.popService.populateOneOrFail(ScheduleGroupType, groupType, "organization");

        const gameMode = await this.popService.populateOneOrFail(Match, match as Match, "gameMode");
        const game = await this.popService.populateOneOrFail(GameMode, gameMode, "game");

        const mledbMatch = await this.getMleSeries(
            awayFranchiseProfile.title,
            homeFranchiseProfile.title,
            week.start,
            season.start,
            gameMode.teamSize === 2 ? LegacyGameMode.DOUBLES : LegacyGameMode.STANDARD,
            match.skillGroup.profile.description.split(" ")[0].toUpperCase() as League,
        );

        if (!mledbMatch.fixture) throw new Error(`mledb match does not have a fixture matchId=${mledbMatch.id}`);

        const mledbFranchiseRelations: FindOptionsRelations<MLE_Team> = {
            franchiseManager: true,
            generalManager: true,
            doublesAssistantGeneralManager: true,
            standardAssistantGeneralManager: true,
        };

        const mledbHomeFranchise = await this.teamRepo.findOneOrFail({
            where: {name: mledbMatch.fixture.homeName},
            relations: mledbFranchiseRelations,
        });
        const mledbAwayFranchise = await this.teamRepo.findOneOrFail({
            where: {name: mledbMatch.fixture.awayName},
            relations: mledbFranchiseRelations,
        });

        const mledbHomeCaptain = await this.teamCaptainRepo.find({
            where: {
                teamName: mledbHomeFranchise.name,
                league: mledbMatch.league,
            },
            relations: {player: true},
        });

        const mledbAwayCaptain = await this.teamCaptainRepo.find({
            where: {
                teamName: mledbAwayFranchise.name,
                league: mledbMatch.league,
            },
            relations: {player: true},
        });

        const stakeholders = [
            mledbHomeFranchise.generalManager.discordId,
            mledbAwayFranchise.generalManager.discordId,

            mledbHomeFranchise.doublesAssistantGeneralManager.discordId,
            mledbAwayFranchise.doublesAssistantGeneralManager.discordId,

            mledbHomeFranchise.standardAssistantGeneralManager.discordId,
            mledbAwayFranchise.standardAssistantGeneralManager.discordId,

            ...mledbHomeCaptain.map(c => c.player.discordId),
            ...mledbAwayCaptain.map(c => c.player.discordId),
        ].filter(s => s !== null) as string[];

        const stakeholdersSet = new Set(stakeholders);

        return {
            organizationId: organization.id,
            stakeholderDiscordIds: Array.from(stakeholdersSet),
            game: game.title,
            gameMode: gameMode.description,
            skillGroup: match.skillGroup.profile.description,
        };
    }

    async markSeriesNcp(seriesId: number, isNcp: boolean, winningTeamName?: string): Promise<string> {
        this.logger.debug(`Begin markSeriesNcp: seriesId=${seriesId}, isNcp=${isNcp}, winningTeam=${winningTeamName}`);

        const series = await this.seriesRepo.findOneOrFail({
            where: {
                id: seriesId,
            },
            relations: {
                fixture: true,
            },
        });

        // winningTeam needs to be 'let' here, since we change it to FA for scrims
        let winningTeam = await this.teamRepo.findOne({
            where: {
                name: winningTeamName,
            },
        });

        if (series.fixture) {
            // Winning team must be specified if NCPing replays
            if (isNcp && !winningTeam) {
                this.logger.error("When NCPing a series associated with a fixture, you must specify a winningTeam");
                throw new Error("When NCPing a series associated with a fixture, you must specify a winningTeam");
            }

            // Check to make sure the winning team played in the series/fixture
            if (
                winningTeam &&
                series.fixture.homeName !== winningTeam.name &&
                series.fixture.awayName !== winningTeam.name
            ) {
                this.logger.error(
                    `The team \`${winningTeam.name}\` did not play in series with id \`${series.id}\` (${series.fixture.awayName} v. ${series.fixture.homeName}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`,
                );
                throw new Error(
                    `The team \`${winningTeam.name}\` did not play in series with id \`${series.id}\` (${series.fixture.awayName} v. ${series.fixture.homeName}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`,
                );
            }
        } else if (series.scrim) {
            winningTeam = await this.teamRepo.findOneOrFail({
                where: {
                    name: "FA",
                },
            });
        } else {
            throw new Error(
                `Somehow you've tried to NCP a series which is neither a scrim nor a fixture. Series details: ${JSON.stringify(
                    series,
                )}`,
            );
        }

        const seriesReplays = await this.seriesReplayRepo.find({
            where: {
                series: {
                    id: seriesId,
                },
            },
        });

        // Set series to Full NCP and set winning team
        series.fullNcp = isNcp;
        await this.seriesRepo.save(series);

        // Update each series replay (including any dummies) to NCP
        const replayIds = seriesReplays.map(seriesReplay => seriesReplay.id);
        await this.markReplaysNcp(replayIds, isNcp, winningTeam ? winningTeam : undefined);

        this.logger.debug(`End markSeriesNcp`);

        return `seriesId=${seriesId} successfully marked fullNcp=${isNcp} with updated elo, and all connected replays had their elo updated.`;
    }

    /**
     * Marks replays as NCP=true/false, and updates the associated Elo of those replays and all connected replays accordingly.
     * "Connected" replays are where replays in which one of the player's in the NCP replay has played. Since the NCP replay will have its elo affects removed,
     * all subsequent replays where those player's played need to be recalculated.
     * @param replayId The replay to mark NCP=true/false.
     * @param isNcp Whether the given replayId should be marked NCP or un-NCP.
     * @returns A string containing status of what was updated.
     */
    async markReplaysNcp(replayIds: number[], isNcp: boolean, winningTeam?: MLE_Team): Promise<string> {
        this.logger.debug(`Begin markReplaysNcp: replayIds=${replayIds}, isNcp=${isNcp}, winningTeam=${winningTeam}`);

        // Winning team must be specified if NCPing replays
        if (isNcp && !winningTeam) return "Can't mark an NCP without a winning team";

        // Make sure we are considering replayIds in chronological order
        replayIds.sort((a, b) => a - b);

        // Gather replays
        const replayPromises = replayIds.map(async rId =>
            this.seriesReplayRepo.findOneOrFail({
                where: {
                    id: rId,
                },
                relations: {
                    teamCoreStats: true,
                },
            }),
        );
        const replays = await Promise.all(replayPromises);

        // Check to make sure the winning team played in each replay
        if (winningTeam) {
            for (const replay of replays) {
                const teamsInReplay = replay.teamCoreStats.map(tcs => tcs.teamName);
                if (!teamsInReplay.includes(winningTeam.name)) {
                    this.logger.warn(
                        `The team \`${winningTeam.name}\` did not play in replay with id \`${
                            replay.id
                        }\` (${teamsInReplay
                            .map(t => t)
                            .join(
                                " v. ",
                            )}), and therefore cannot be marked as the winner of this NCP. Cancelling process with no action taken.`,
                    );
                    this.logger.warn(
                        `Could not find team=${winningTeam.name} on replay with id=${replay.id}, cannot mark as NCP`,
                    );
                    throw new Error(
                        `Could not find team=${winningTeam.name} on replay with id=${replay.id}, cannot mark as NCP`,
                    );
                }
            }
        }

        // Set replays to NCP true/false and update winning team/color
        for (const replay of replays) {
            let newWinningTeam: string | undefined;
            let newWinningColor: string | null | undefined;

            // Handle NCPing/Un-NCPing with non-dummy/dummy replays
            if (isNcp) {
                // Set winningTeam to newWinningTeam
                if (!replay.isDummy) {
                    // Set winningColor depending on previous/new winningTeam
                    newWinningColor =
                        winningTeam?.name === replay.winningTeamName
                            ? (replay.winningColor as string | undefined)
                            : null;
                } else {
                    // Set winningColor to null
                    newWinningColor = null;
                }
            } else if (!replay.isDummy) {
                // Set winningTeam based on goals scored
                const winningTeamName = replay.teamCoreStats.find(tcs =>
                    tcs.goals && tcs.goalsAgainst ? tcs.goals > tcs.goalsAgainst : false,
                )?.teamName as string | undefined;

                if (!winningTeam)
                    throw new Error(`Could not find winning team when un-NCPing replay with id=${replay.id}`);
                newWinningTeam = winningTeamName;

                // Set winningColor depending on previous/new winningTeam
                newWinningColor =
                    winningTeam.name === replay.winningTeamName ? (replay.winningColor as string | undefined) : null;
            }

            replay.ncp = isNcp;
            replay.winningTeamName = newWinningTeam as string | null;
            replay.winningColor = newWinningColor as string | null;
            this.logger.debug(`Trying to save series replay ${JSON.stringify(replay)}`);
            await this.seriesReplayRepo.save(replay);
        }
        this.logger.debug(`End markReplaysNcp`);

        return `\`${
            replayIds.length === 1 ? `replayId=${replayIds[0]}` : `replayIds=[${replayIds.join(", ")}]`
        }\` successfully marked \`ncp=${isNcp}\`, ${winningTeam ? `\`winningTeam=${winningTeam.name}\`` : ""}.`;
    }
}
