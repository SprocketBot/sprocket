import {Injectable, Logger} from "@nestjs/common";
import type {
    BallchasingResponse,
    CoreSuccessResponse,
    GetPlayer,
    MatchReplaySubmission,
    ReplaySubmission,
    ScrimReplaySubmission,
} from "@sprocketbot/common";
import {
    config,
    CoreEndpoint,
    CoreService,
    MatchmakingEndpoint,
    MatchmakingService,
    MinioService,
    readToString,
    ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";
import {isEqual} from "lodash";

import type {UserWithPlatformId} from "./types/user-with-platform-id";
import type {ValidationError, ValidationResult} from "./types/validation-result";
import {sortIds} from "./utils";

@Injectable()
export class ReplayValidationService {
    private readonly logger: Logger = new Logger(ReplayValidationService.name);

    constructor(
        private readonly coreService: CoreService,
        private readonly matchmakingService: MatchmakingService,
        private readonly minioService: MinioService,
    ) {}

    async validate(submission: ReplaySubmission): Promise<ValidationResult> {
        if (submission.type === ReplaySubmissionType.SCRIM) {
            return this.validateScrimSubmission(submission);
        }
        return this.validateMatchSubmission(submission);
    }

    private async validateScrimSubmission(submission: ScrimReplaySubmission): Promise<ValidationResult> {
        const scrimResponse = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (scrimResponse.status === ResponseStatus.ERROR) {
            throw scrimResponse.error;
        }

        const scrim = scrimResponse.data;

        // ========================================
        // Validate number of games
        // ========================================
        if (!scrim.games) {
            throw new Error(`Unable to validate gameCount for scrim ${scrim.id} because it has no games`);
        }

        const submissionGameCount = submission.items.length;
        const scrimGameCount = scrim.games.length;

        if (submissionGameCount !== scrimGameCount) {
            return {
                valid: false,
                errors: [
                    {
                        error: `Incorrect number of replays submitted, expected ${scrimGameCount} but found ${submissionGameCount}`,
                    },
                ],
            };
        }

        const gameCount = submissionGameCount;

        const progressErrors = submission.items.reduce<ValidationError[]>((r, v) => {
            if (v.progress?.error) {
                this.logger.error(
                    `Error in submission found, scrim=${scrim.id} submissionId=${scrim.submissionId}\n${v.progress.error}`,
                );
                r.push({
                    error: `Error encountered while parsing file ${v.originalFilename}`,
                });
            }
            return r;
        }, []);
        if (progressErrors.length) {
            return {
                valid: false,
                errors: progressErrors,
            };
        }

        // ========================================
        // Validate the correct players played
        // ========================================
        // All items should have an outputPath
        if (!submission.items.every(i => i.outputPath)) {
            this.logger.error(
                `Unable to validate submission with missing outputPath, scrim=${scrim.id} submissionId=${scrim.submissionId}`,
            );
            return {
                valid: false,
                errors: [],
            };
        }

        // We should have stats for every game
        const stats = await Promise.all(submission.items.map(async i => this.getStats(i.outputPath!)));
        if (stats.length !== gameCount) {
            this.logger.error(
                `Unable to validate submission missing stats, scrim=${scrim.id} submissionId=${scrim.submissionId}`,
            );
            return {
                valid: false,
                errors: [
                    {
                        error: "The submission is missing stats. Please contact support.",
                    },
                ],
            };
        }

        // Get platformIds from stats
        const ballchasingIds = stats.flatMap(s =>
            [s.blue, s.orange].flatMap(t =>
                t.players.flatMap(p => ({
                    platform: p.id.platform,
                    id: p.id.id,
                    name: p.name,
                })),
            ),
        );
        const platformIds = ballchasingIds.map(bId => ({
            platform: bId.platform.toUpperCase(),
            platformId: bId.id,
        }));

        // Look up players by their platformIds
        const playersResponse = await this.coreService.send(CoreEndpoint.GetPlayersByPlatformIds, platformIds);
        if (playersResponse.status === ResponseStatus.ERROR) {
            this.logger.error(
                `Unable to validate submission, couldn't find all players by their platformIds`,
                playersResponse.error,
            );
            return {
                valid: false,
                errors: [
                    {
                        error: "A player played on an unreported account. Please contact support for help.",
                    },
                ],
            };
        }
        const playersData = playersResponse.data;
        const playerErrors: ValidationError[] = [];

        for (const player of playersData) {
            if (!player.success) {
                playerErrors.push({
                    error: `${player.error} (${
                        ballchasingIds.find((id, i) => id.id === platformIds[i].platformId)?.name
                    })`,
                });
            }
        }

        if (playerErrors.length)
            return {
                valid: false,
                errors: playerErrors,
            };

        const players = playersData.map(p => (p.success ? p.data : undefined)) as GetPlayer[];

        const userIdsResponses = await Promise.all(
            players.map(async p =>
                this.coreService.send(CoreEndpoint.GetUserByAuthAccount, {
                    accountType: "DISCORD",
                    accountId: p.discordId,
                }),
            ),
        );

        if (userIdsResponses.some(r => r.status === ResponseStatus.ERROR)) {
            // Build up a list of failed player Discord IDs to return in the error response.
            const sprocketUserErrors: ValidationError[] = [];

            userIdsResponses.forEach((r, i) => {
                if (r.status === ResponseStatus.ERROR) {
                    sprocketUserErrors.push({
                        error: `Could not find a Sprocket account for ${players[i].discordId}`,
                        playerIndex: i,
                    });
                }
            });

            sprocketUserErrors.forEach(err => {
                this.logger.error(err.error);
            });
            return {
                valid: false,
                errors: sprocketUserErrors,
            };
        }
        const userIds = userIdsResponses.map(r => (r as CoreSuccessResponse<CoreEndpoint.GetUserByAuthAccount>).data);

        // Add platformIds to players
        const userAndPlatformIds: UserWithPlatformId[] = userIds.map((u, i) => ({
            ...u,
            // Arrays should be in the same order
            platform: platformIds[i].platform,
            platformId: platformIds[i].platformId,
        }));

        // Get 3D array of scrim player ids
        const scrimPlayerIds = scrim.games.map(g => g.teams.map(t => t.players.map(p => p.id)));

        // Get 3D array of submission player ids
        const submissionUserIds = stats.map(s =>
            [s.blue, s.orange].map(t =>
                t.players.map(({id}) => {
                    const user = userAndPlatformIds.find(
                        p => p.platform === id.platform.toUpperCase() && p.platformId === id.id,
                    )!;
                    return user.id;
                }),
            ),
        );

        // Sort IDs so that they are in the same order ready to compare
        const sortedScrimPlayerIds = sortIds(scrimPlayerIds);
        const sortedSubmissionUserIds = sortIds(submissionUserIds);

        const expectedMatchups = Array.from(sortedScrimPlayerIds);

        // For each game, make sure the players were on correct teams
        for (let g = 0; g < gameCount; g++) {
            const submissionGame = sortedSubmissionUserIds[g];
            let matchupIndex: number;

            if (expectedMatchups.some(expectedMatchup => isEqual(submissionGame, expectedMatchup))) {
                matchupIndex = expectedMatchups.findIndex(expectedMatchup => isEqual(submissionGame, expectedMatchup));
                expectedMatchups.splice(matchupIndex, 1);
            } else {
                return {
                    valid: false,
                    errors: [
                        {
                            error: "Mismatched player",
                            gameIndex: g,
                        },
                    ],
                };
            }

            const scrimGame = sortedScrimPlayerIds[matchupIndex];

            for (let t = 0; t < scrim.settings.teamCount; t++) {
                const scrimTeam = scrimGame[t];
                const submissionTeam = submissionGame[t];
                if (scrimTeam.length !== submissionTeam.length) {
                    return {
                        valid: false,
                        errors: [
                            {
                                error: "Invalid team size",
                                gameIndex: g,
                                teamIndex: t,
                            },
                        ],
                    };
                }
            }
            if (scrimGame.length !== submissionGame.length) {
                return {
                    valid: false,
                    errors: [
                        {
                            error: "Invalid team count",
                            gameIndex: g,
                        },
                    ],
                };
            }
        }

        // ========================================
        // Validate players are in the correct skill group if the scrim is competitive
        // ========================================
        if (scrim.settings.competitive)
            for (const player of players) {
                if (player.skillGroupId !== scrim.skillGroupId) {
                    return {
                        valid: false,
                        errors: [
                            {
                                error: "One of the players isn't in the correct skill group",
                            },
                        ],
                    };
                }
            }

        // ========================================
        // Submission is valid
        // ========================================
        return {
            valid: true,
        };
    }

    private async getStats(outputPath: string): Promise<BallchasingResponse> {
        const r = await this.minioService.get(config.minio.bucketNames.replays, outputPath);
        const stats = await readToString(r);
        return JSON.parse(stats).data as BallchasingResponse;
    }

    private async validateMatchSubmission(submission: MatchReplaySubmission): Promise<ValidationResult> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;
        const match = matchResult.data;

        const homeName = match.homeFranchise!.name;
        const awayName = match.awayFranchise!.name;

        const errors: ValidationError[] = [];

        for (const item of submission.items) {
            if (!item.progress?.result) {
                return {
                    valid: false,
                    errors: [
                        {
                            error: "Incomplete Replay Found, please wait for submission to complete ",
                        },
                    ],
                };
            }

            const blueBcPlayers = item.progress.result.data.blue.players;
            const orangeBcPlayers = item.progress.result.data.orange.players;
            try {
                const [bluePlayersResponse, orangePlayersResponse] = await Promise.all([
                    this.coreService
                        .send(
                            CoreEndpoint.GetPlayersByPlatformIds,
                            orangeBcPlayers.map(m => ({
                                platform: m.id.platform,
                                platformId: m.id.id,
                            })),
                        )
                        .then(r => {
                            if (r.status === ResponseStatus.ERROR) throw r.error;
                            return r.data;
                        }),
                    this.coreService
                        .send(
                            CoreEndpoint.GetPlayersByPlatformIds,
                            blueBcPlayers.map(m => ({
                                platform: m.id.platform,
                                platformId: m.id.id,
                            })),
                        )
                        .then(r => {
                            if (r.status === ResponseStatus.ERROR) throw r.error;
                            return r.data;
                        }),
                ]);

                const playerErrors: ValidationError[] = [];

                for (const player of [...bluePlayersResponse, ...orangePlayersResponse]) {
                    if (!player.success) {
                        playerErrors.push({error: player.error});
                    }
                }

                if (playerErrors.length)
                    return {
                        valid: false,
                        errors: playerErrors,
                    };

                const bluePlayers = bluePlayersResponse.map(p => (p.success ? p.data : undefined)) as GetPlayer[];
                const orangePlayers = orangePlayersResponse.map(p => (p.success ? p.data : undefined)) as GetPlayer[];

                const blueTeam = bluePlayers[0].franchise.name;
                const orangeTeam = orangePlayers[0].franchise.name;

                if (blueTeam === orangeTeam) {
                    errors.push({
                        error: `Players from a single franchise found on both teams in replay ${item.originalFilename}`,
                    });
                }

                if (!bluePlayers.every(bp => bp.franchise.name === blueTeam)) {
                    errors.push({
                        error: `Multiple franchises found for blue team in replay ${item.originalFilename}`,
                    });
                }
                if (!orangePlayers.every(op => op.franchise.name === orangeTeam)) {
                    errors.push({
                        error: `Multiple franchises found for orange team in replay ${item.originalFilename}`,
                    });
                }

                if (![blueTeam, orangeTeam].includes(awayName)) {
                    errors.push({
                        error: `Away team ${awayName} not found in replay ${item.originalFilename}. (Found ${blueTeam} and ${orangeTeam})`,
                    });
                }
                if (![blueTeam, orangeTeam].includes(homeName)) {
                    errors.push({
                        error: `Home team ${homeName} not found in replay ${item.originalFilename}. (Found ${blueTeam} and ${orangeTeam})`,
                    });
                }

                if (![...bluePlayers, ...orangePlayers].every(p => p.skillGroupId === match.skillGroupId)) {
                    errors.push({
                        error: `Player(s) from incorrect skill group found in replay ${item.originalFilename}`,
                    });
                    this.logger.verbose(
                        JSON.stringify({
                            expected: match.skillGroupId,
                            found: [
                                ...bluePlayers.map(bp => [bp.id, bp.skillGroupId]),
                                ...orangePlayers.map(p => [p.id, p.skillGroupId]),
                            ],
                        }),
                    );
                }
            } catch (e) {
                this.logger.error("Error looking up match participants", e);
                errors.push({
                    error: `Error looking up match participants in replay ${item.originalFilename}`,
                });
            }
        }
        if (errors.length) {
            return {
                valid: false,
                errors: errors,
            };
        }

        return {
            valid: true,
        };
    }
}
