import {Injectable, Logger} from "@nestjs/common";
import type {
    BallchasingResponse, CoreSuccessResponse, ReplaySubmission, ScrimReplaySubmission,
} from "@sprocketbot/common";
import {
    config,
    CoreEndpoint, CoreService, MatchmakingEndpoint,
    MatchmakingService, MinioService, ReplaySubmissionType,
    ResponseStatus,
} from "@sprocketbot/common";

import type {UserWithPlatformId} from "./types/user-with-platform-id";
import type {ValidationResult} from "./types/validation-result";
import {readableToString} from "./utils";
import {sortIds} from "./utils/deepSort";

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
        return this.validateMatchSubmission();
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
                errors: [ {
                    error: `Incorrect number of replays submitted, expected ${scrimGameCount} but found ${submissionGameCount}`,
                } ],
            };
        }

        const gameCount = submissionGameCount;
        
        // ========================================
        // Validate the correct players played
        // ========================================
        // All items should have an outputPath
        if (!submission.items.every(i => i.outputPath)) {
            this.logger.error(`Unable to validate submission with missing outputPath, scrim=${scrim.id} submissionId=${scrim.submissionId}`);
            return {
                valid: false,
                errors: [],
            };
        }

        // We should have stats for every game
        const stats = await Promise.all(submission.items.map(async i => this.getStats(i.outputPath!)));
        if (stats.length !== gameCount) {
            this.logger.error(`Unable to validate submission missing stats, scrim=${scrim.id} submissionId=${scrim.submissionId}`);
            return {
                valid: false,
                errors: [],
            };
        }

        // Get platformIds from stats
        const ballchasingIds = stats.flatMap(s => [s.blue, s.orange].flatMap(t => t.players.flatMap(p => p.id)));
        const platformIds = ballchasingIds.map(bId => ({platform: bId.platform.toUpperCase(), platformId: bId.id}));

        // Look up players by their platformIds
        const playersResponse = await this.coreService.send(CoreEndpoint.GetPlayersByPlatformIds, platformIds);
        if (playersResponse.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to validate submission, couldn't find all players by their platformIds`, playersResponse.error);
            return {
                valid: false,
                errors: [],
            };
        }
        const players = playersResponse.data;

        const userIdsResponses = await Promise.all(players.map(async p => this.coreService.send(CoreEndpoint.GetUserByDiscordId, {discordId: p.discordId})));
        if (userIdsResponses.some(r => r.status === ResponseStatus.ERROR)) {
            this.logger.error(`Unable to validate submission, couldn't map from MLE player to Sprocket user by discordId`, JSON.stringify(userIdsResponses));
            return {
                valid: false,
                errors: [],
            };
        }
        const userIds = userIdsResponses.map(r => (r as CoreSuccessResponse<CoreEndpoint.GetUserByDiscordId>).data);
        
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
        const submissionUserIds = stats.map(s => [s.blue, s.orange].map(t => t.players.map(({id}) => {
            const user = userAndPlatformIds.find(p => p.platform === id.platform.toUpperCase() && p.platformId === id.id)!;
            return user.id;
        })));

        // Sort IDs so that they are in the same order ready to compare
        const sortedScrimPlayerIds = sortIds(scrimPlayerIds);
        const sortedSubmissionUserIds = sortIds(submissionUserIds);

        // For each game, make sure the players were on correct teams
        for (let g = 0; g < gameCount; g++) {
            const scrimGame = sortedScrimPlayerIds[g];
            const submissionGame = sortedSubmissionUserIds[g];
            for (let t = 0; t < scrim.settings.teamCount; t++) {
                const scrimTeam = scrimGame[t];
                const submissionTeam = submissionGame[t];
                for (let p = 0; p < scrim.settings.teamSize; p++) {
                    const scrimPlayerId = scrimTeam[p];
                    const submissionPlayerId = submissionTeam[p];
                    if (scrimPlayerId !== submissionPlayerId) {
                        return {
                            valid: false,
                            errors: [ {
                                error: `Mismatched player`,
                                gameIndex: g,
                            } ],
                        };
                    }
                }
                if (scrimTeam.length !== submissionTeam.length) {
                    return {
                        valid: false,
                        errors: [ {
                            error: "Invalid team size",
                            gameIndex: g,
                            teamIndex: t,
                        } ],
                    };
                }
            }
            if (scrimGame.length !== submissionGame.length) {
                return {
                    valid: false,
                    errors: [ {
                        error: "Invalid team count",
                        gameIndex: g,
                    } ],
                };
            }
        }

        // ========================================
        // Validate players are in the correct skill group
        // ========================================
        for (const player of players) {
            if (player.skillGroupId !== scrim.skillGroupId) {
                return {
                    valid: false,
                    errors: [ {
                        error: "One of the players isn't in the correct skill group",
                    } ],
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
        const stats = await readableToString(r);
        return JSON.parse(stats).data as BallchasingResponse;
    }

    private async validateMatchSubmission(): Promise<ValidationResult> {
        return {
            valid: false,
            errors: [ {
                error: "Submitting replays for matches is not yet supported",
            } ],
        };
    }
}
