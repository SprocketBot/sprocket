import {Injectable, Logger} from "@nestjs/common";
import {
    BallchasingPlayer,
    BallchasingPlayerSchema,
    BallchasingResponse,
    BallchasingResponseSchema,
    BallchasingTeam,
    BallchasingTeamSchema,
    BallchasingTeamStatsSchema,
    BallchasingUploader,
    BallchasingUploaderSchema,
    GetPlayerSuccessResponse,
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

import type {ValidationError, ValidationResult} from "./types/validation-result";
import {sortIds} from "./utils";
import {BallchasingConverterService} from "@sprocketbot/core/src/replay-parse/finalization";

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
        if (scrimResponse.status === ResponseStatus.ERROR) throw scrimResponse.error;
        if (!scrimResponse.data) throw new Error("Scrim not found");
        
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

        const progressErrors = submission.items.reduce<ValidationError[]>((r, v) => {
            if (v.progress?.error) {
                this.logger.error(`Error in submission found, scrim=${scrim.id} submissionId=${scrim.submissionId}\n${v.progress.error}`);
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
                errors: [ {error: "The submission is missing stats. Please contact support."} ],
            };
        }

        const gameResult = await this.coreService.send(CoreEndpoint.GetGameByGameMode, {gameModeId: scrim.gameModeId});
        if (gameResult.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to get game gameMode=${scrim.gameModeId}`);
            return {
                valid: false,
                errors: [ {error: `Failed to find associated game. Please contact support.`} ],
            };
        }

        // Get platformIds from stats
        // Don't send the same request for multiple players
        const uniqueBallchasingPlayerIds = Array.from(new Set(stats.flatMap(s => [s.blue, s.orange].flatMap(t => t.players.flatMap(p => ({
            name: p.name,
            platform: p.id.platform.toUpperCase(),
            id: p.id.id,
        }))))));
        
        // Look up players by their platformIds
        const playersResponse = await this.coreService.send(CoreEndpoint.GetPlayersByPlatformIds, uniqueBallchasingPlayerIds.map(bId => ({
            gameId: gameResult.data.id,
            platform: bId.platform,
            platformId: bId.id,
        })));
        if (playersResponse.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to validate submission, couldn't find all players by their platformIds`, playersResponse.error);
            return {
                valid: false,
                errors: [ {error: "Failed to find all players by their platform Ids. Please contact support."} ],
            };
        }
        
        const playerErrors: string[] = [];
        for (const player of playersResponse.data) {
            if (!player.success) {
                playerErrors.push(uniqueBallchasingPlayerIds.find(bcPlayer => bcPlayer.platform === player.request.platform && bcPlayer.id === player.request.platformId)!.name);
            }
        }

        if (playerErrors.length) return {
            valid: false,
            errors: [
                {
                    error: `One or more players played on an unreported account: ${playerErrors.join(", ")}`,
                },
            ],
        };

        const players = playersResponse.data as GetPlayerSuccessResponse[];
        // Get 3D array of scrim player ids
        const scrimPlayerIds = scrim.games.map(g => g.teams.map(t => t.players.map(p => p.id)));

        // Get 3D array of submission player ids
        const submissionUserIds = stats.map(s => [s.blue, s.orange].map(t => t.players.map(({id}) => {
            const user = players.find(p => p.request.platform === id.platform.toUpperCase() && p.request.platformId === id.id)!;
            return user.data.userId;
        })));

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
                    errors: [ {
                        error: "Mismatched player",
                        gameIndex: g,
                    } ],
                };
            }

            const scrimGame = sortedScrimPlayerIds[matchupIndex];
            
            for (let t = 0; t < scrim.settings.teamCount; t++) {
                const scrimTeam = scrimGame[t];
                const submissionTeam = submissionGame[t];
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
        // Validate players are in the correct skill group if the scrim is competitive
        // ========================================
        if (scrim.settings.competitive) for (const player of players) {
            if (player.data.skillGroupId !== scrim.skillGroupId) {
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
        const stats = await readToString(r);
        let parsed = BallchasingResponseSchema.safeParse(stats);
        if (!parsed.success) {
            // Call our fancy new routine
            const output = this.cts.translate(stats);
            parsed = BallchasingResponseSchema.safeParse(output);
        }
        return parsed.data;
        return JSON.parse(stats).data as BallchasingResponse;
    }


    private async translate(inputStats): Promise<BallchasingResponse> {

        const orangePlayers: BallchasingPlayer[] = [];
        const bluePlayers: BallchasingPlayer[] = [];

        for (const player of inputStats["players"]) {
            if (player["isOrange"]) {
                orangePlayers.push(player); 
            } else {
                bluePlayers.push(player);
            }
        }
        

        const blue: BallchasingTeam = {
            name: "blue",
            color: "blue",
            stats: BallchasingTeamStatsSchema,
            players: bluePlayers,
        }

        const orange: BallchasingTeam = {
            name: "orange",
            color: "orange",
            stats: BallchasingTeamStatsSchema,
            players: orangePlayers,
        }

        const uploader: BallchasingUploader = {
            name: "Uploader", // Missing from CarBall -> Use who uploads the Replay from Sprocket
            avatar: "https://ballchasing.com/NotTheBlueAvatars", // Missing from CarBall
            steam_id: "", // Missing from CarBall
            profile_url: "https://ballchasing.com/NoProfileHere" // Missing from CarBall
        }

        return {
            // Response meta
            id: "bc_ID", // ID provided by Ballchasing
            link: "https://ballchsing.com/broken",
            title: inputStats["gameMetadata"]["name"],
            date: new Date().toUTCString(),
            date_has_timezone: false,
            status: "ok",
            created: new Date().toUTCString(),
            visibility: "public",

            // Rocket League meta
            rocket_league_id: inputStats["gameMetadata"]["id"],
            season: 10, // Missing from CarBall
            match_guid: inputStats["matchGuid"],

            // Uploader
            recorder: "N/A", // Optional
            uploader: uploader,

            // Match
            match_type: "", // Missing from CarBall -> Looking for online/private

            // Playlist
            playlist_id: inputStats["gameMetadata"]["playlist"], // Carball has _ instead of - 
            playlist_name: inputStats["gameMetadata"]["playlist"], // Missing from Carball 

            // Map
            map_code: inputStats["gameMetadata"]["map"],
            map_name: "", // Missing from CarBall

            // Duration
            duration: inputStats["gameMetadata"]["length"], // Assuming
            overtime: false, //Missing from CarBall
            overtime_seconds: 0, //Missing from CarBall

            // Team stats
            team_size: inputStats["gameMetadata"]["teamSize"],
            blue: blue,
            orange: orange,
        }
    }

    private async validateMatchSubmission(submission: MatchReplaySubmission): Promise<ValidationResult> {
        const matchResult = await this.coreService.send(CoreEndpoint.GetMatchById, {matchId: submission.matchId});
        if (matchResult.status === ResponseStatus.ERROR) throw matchResult.error;
        const match = matchResult.data;

        const gameResult = await this.coreService.send(CoreEndpoint.GetGameByGameMode, {gameModeId: match.gameModeId});
        if (gameResult.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to get game gameMode=${match.gameModeId}`);
            return {
                valid: false,
                errors: [ {error: `Failed to find associated game. Please contact support.`} ],
            };
        }

        const homeName = match.homeFranchise!.name;
        const awayName = match.awayFranchise!.name;

        const errors: ValidationError[] = [];

        if (!submission.items.every(i => i.progress?.result)) {
            return {
                valid: false,
                errors: [ {error: "Incomplete Replay Found, please wait for submission to complete"} ],
            };
        }

        const uniqueBallchasingPlayerIds = Array.from(new Set(submission.items.flatMap(s => [s.progress!.result!.data.blue, s.progress!.result!.data.orange].flatMap(t => t.players.flatMap(p => ({
            name: p.name,
            platform: p.id.platform.toUpperCase(),
            id: p.id.id,
        }))))));
        
        // Look up players by their platformIds
        const playersResponse = await this.coreService.send(CoreEndpoint.GetPlayersByPlatformIds, uniqueBallchasingPlayerIds.map(bId => ({
            gameId: gameResult.data.id,
            platform: bId.platform,
            platformId: bId.id,
        })));
        if (playersResponse.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to validate submission, couldn't find all players by their platformIds`, playersResponse.error);
            return {
                valid: false,
                errors: [ {error: "Failed to find all players by their platform Ids. Please contact support."} ],
            };
        }
        
        const playerErrors: string[] = [];
        for (const player of playersResponse.data) {
            if (!player.success) {
                playerErrors.push(uniqueBallchasingPlayerIds.find(bcPlayer => bcPlayer.platform === player.request.platform && bcPlayer.id === player.request.platformId)!.name);
            }
        }

        if (playerErrors.length) return {
            valid: false,
            errors: [
                {
                    error: `One or more players played on an unreported account: ${playerErrors.join(", ")}`,
                },
            ],
        };

        const players = playersResponse.data as GetPlayerSuccessResponse[];

        for (const item of submission.items) {
            const blueBcPlayers = item.progress!.result!.data.blue.players;
            const orangeBcPlayers = item.progress!.result!.data.orange.players;

            try {
                const bluePlayers = blueBcPlayers.map(bcp => players.find(p => p.request.platform === bcp.id.platform.toUpperCase() && p.request.platformId === bcp.id.id)!.data);
                const orangePlayers = orangeBcPlayers.map(bcp => players.find(p => p.request.platform === bcp.id.platform.toUpperCase() && p.request.platformId === bcp.id.id)!.data);

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
                    this.logger.verbose(JSON.stringify({
                        expected: match.skillGroupId,
                        found: [...bluePlayers.map(bp => [bp.id, bp.skillGroupId]), ...orangePlayers.map(p => [p.id, p.skillGroupId])],
                    }));
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
                valid: false, errors: errors,
            };
        }

        return {
            valid: true,
        };
    }
}
