import {Injectable, Logger} from "@nestjs/common";
import {
    BallchasingPlayer,
    BallchasingPlayerStats,
    BallchasingPlayerSchema,
    BallchasingResponse,
    BallchasingResponseSchema,
    BallchasingTeam,
    BallchasingTeamSchema,
    BallchasingTeamStatsSchema,
    BallchasingTeamStats,
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
    ) { }

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
                errors: [{
                    error: `Incorrect number of replays submitted, expected ${scrimGameCount} but found ${submissionGameCount}`,
                }],
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
                errors: [{ error: "The submission is missing stats. Please contact support." }],
            };
        }

        const gameResult = await this.coreService.send(CoreEndpoint.GetGameByGameMode, { gameModeId: scrim.gameModeId });
        if (gameResult.status === ResponseStatus.ERROR) {
            this.logger.error(`Unable to get game gameMode=${scrim.gameModeId}`);
            return {
                valid: false,
                errors: [{ error: `Failed to find associated game. Please contact support.` }],
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
                errors: [{ error: "Failed to find all players by their platform Ids. Please contact support." }],
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
        const submissionUserIds = stats.map(s => [s.blue, s.orange].map(t => t.players.map(({ id }) => {
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
                    errors: [{
                        error: "Mismatched player",
                        gameIndex: g,
                    }],
                };
            }

            const scrimGame = sortedScrimPlayerIds[matchupIndex];
            
            for (let t = 0; t < scrim.settings.teamCount; t++) {
                const scrimTeam = scrimGame[t];
                const submissionTeam = submissionGame[t];
                if (scrimTeam.length !== submissionTeam.length) {
                    return {
                        valid: false,
                        errors: [{
                            error: "Invalid team size",
                            gameIndex: g,
                            teamIndex: t,
                        }],
                    };
                }
            }
            if (scrimGame.length !== submissionGame.length) {
                return {
                    valid: false,
                    errors: [{
                        error: "Invalid team count",
                        gameIndex: g,
                    }],
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
                    errors: [{
                        error: "One of the players isn't in the correct skill group",
                    }],
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
            const translated = this.translate(stats);
            const output = BallchasingResponseSchema.safeParse(translated);

            if (output.success) return output.data;
        } else {
            return parsed.data;
        }
        
        throw new Error("Could not convert parsed file to a usable stats object.");
        
    }

    private translateTeamStats(players: BallchasingPlayer[]): BallchasingTeamStats {
        let tsc = {
            goals: 0,
            saves: 0,
            score: 0,
            shots: 0,
            assists: 0,
            goals_against: 0,
            shots_against: 0,
            shooting_percentage: 0,
        };

        for (const player of players) {
            tsc.goals += player.stats.core.goals;
            tsc.saves += player.stats.core.saves;
            tsc.score += player.stats.core.score;
            tsc.shots += player.stats.core.shots;
            tsc.assists += player.stats.core.assists;
            tsc.goals_against += player.stats.core.goals_against;
            tsc.shots_against += player.stats.core.shots_against;
            tsc.shooting_percentage += player.stats.core.shooting_percentage;
        }

        return {
            ball: {
                time_in_side: 0,
                possession_time: 0,
            },
            core: tsc,
            boost: {
                bpm: 0,
                bcpm: 0,
                avg_amount: 0,
                amount_stolen: 0,
                amount_overfill: 0,
                time_boost_0_25: 0,
                time_full_boost: 0,
                time_zero_boost: 0,
                amount_collected: 0,
                count_stolen_big: 0,
                time_boost_25_50: 0,
                time_boost_50_75: 0,
                amount_stolen_big: 0,
                time_boost_75_100: 0,
                count_stolen_small: 0,
                amount_stolen_small: 0,
                count_collected_big: 0,
                amount_collected_big: 0,
                count_collected_small: 0,
                amount_collected_small: 0,
                amount_overfill_stolen: 0,
                amount_used_while_supersonic: 0,
            },
            movement: {
                time_ground: 0,
                time_low_air: 0,
                time_high_air: 0,
                total_distance: 0,
                time_powerslide: 0,
                time_slow_speed: 0,
                count_powerslide: 0,
                time_boost_speed: 0,
                time_supersonic_speed: 0,
            },
            positioning: {
                time_behind_ball: 0,
                time_infront_ball: 0,
                time_neutral_third: 0,
                time_defensive_half: 0,
                time_offensive_half: 0,
                time_defensive_third: 0,
                time_offensive_third: 0,
            },
        } as unknown as BallchasingTeamStats;
   }

    private translatePlayerStats(input, shots, goals): BallchasingPlayerStats {
        return {
            core: {
                mvp: false,
                goals: input["goals"],
                saves: input["saves"],
                score: input["score"],
                shots: input["shots"],
                assists: input["assists"],
                goals_against: input["isOrange"] === 1 ? goals.blue : goals.orange,
                shots_against: input["isOrange"] === 1 ? shots.blue : shots.orange,
                shooting_percentage: input["goals"]/input["shots"],
            },
            demo: {
                taken: 0,
                inflicted: 0,
            },
            boost: {
                bpm: 0,
                bcpm: 0,
                avg_amount: 0,
                amount_stolen: 0,
                amount_overfill: 0,
                time_boost_0_25: 0,
                time_full_boost: 0,
                time_zero_boost: 0,
                amount_collected: 0,
                count_stolen_big: 0,
                time_boost_25_50: 0,
                time_boost_50_75: 0,
                amount_stolen_big: 0,
                time_boost_75_100: 0,
                count_stolen_small: 0,
                percent_boost_0_25: 0,
                percent_full_boost: 0,
                percent_zero_boost: 0,
                amount_stolen_small: 0,
                count_collected_big: 0,
                percent_boost_25_50: 0,
                percent_boost_50_75: 0,
                amount_collected_big: 0,
                percent_boost_75_100: 0,
                count_collected_small: 0,
                amount_collected_small: 0,
                amount_overfill_stolen: 0,
                amount_used_while_supersonic: 0,
            },
            movement: {
                avg_speed: 0,
                time_ground: 0,
                time_low_air: 0,
                time_high_air: 0,
                percent_ground: 0,
                total_distance: 0,
                percent_low_air: 0,
                time_powerslide: 0,
                time_slow_speed: 0,
                count_powerslide: 0,
                percent_high_air: 0,
                time_boost_speed: 0,
                percent_slow_speed: 0,
                percent_boost_speed: 0,
                avg_speed_percentage: 0,
                time_supersonic_speed: 0,
                avg_powerslide_duration: 0,
                percent_supersonic_speed: 0,
            },
            positioning: {
                time_most_back: 0,
                time_behind_ball: 0,
                percent_most_back: 0,
                time_infront_ball: 0,
                time_most_forward: 0,
                time_neutral_third: 0,
                percent_behind_ball: 0,
                time_defensive_half: 0,
                time_offensive_half: 0,
                avg_distance_to_ball: 0,
                percent_infront_ball: 0,
                percent_most_forward: 0,
                time_closest_to_ball: 0,
                time_defensive_third: 0,
                time_offensive_third: 0,
                avg_distance_to_mates: 0,
                percent_neutral_third: 0,
                percent_defensive_half: 0,
                percent_offensive_half: 0,
                percent_closest_to_ball: 0,
                percent_defensive_third: 0,
                percent_offensive_third: 0,
                time_farthest_from_ball: 0,
                percent_farthest_from_ball: 0,
                avg_distance_to_ball_possession: 0,
                goals_against_while_last_defender: 0,
                avg_distance_to_ball_no_possession: 0,
            },
        }
    }

    private getPlatformString(input: string): "steam" | "epic" | "xbox" | "ps4" {
        if (input === "OnlinePlatform_Steam") return "steam";
        if (input === "OnlinePlatform_Epic") return "epic";
        if (input === "OnlinePlatform_Dingo") return "xbox";
        if (input === "OnlinePlatform_PSN") return "ps4";
        
        return "epic";
    }

    private translatePlayer(playerStats, shots, goals): BallchasingPlayer {
        return {
            id: {
                id: playerStats["id"]["id"],
                platform: this.getPlatformString(playerStats["platform"]),
            },
            name: playerStats["name"],
            camera: {
                fov: playerStats["cameraSettings"]["fieldOfView"],
                pitch: playerStats["cameraSettings"]["pitch"],
                height: playerStats["cameraSettings"]["height"],
                distance: playerStats["cameraSettings"]["distance"],
                stiffness: playerStats["cameraSettings"]["stiffness"],
                swivel_speed: playerStats["cameraSettings"]["swivelSpeed"],
                transition_speed: playerStats["cameraSettings"]["transitionSpeed"],
            },
            car_id: -1,
            car_name: "UNKNOWN",
            end_time: 1000,
            start_time: 5,
            steering_sensitivity: 1.1,
        
            stats: this.translatePlayerStats(playerStats, shots, goals),
        })
    }

    private translate(inputStats) {

        const orangePlayers: BallchasingPlayer[] = [];
        const bluePlayers: BallchasingPlayer[] = [];

        let shots = {
            blue: 0,
            orange: 0,
        };
        let goals = {
            blue: 0,
            orange: 0,
        };

        for (const player of inputStats["players"]) {
            if (player["isOrange"] === 1) {
                shots.orange += player["shots"];
                goals.orange += player["goals"];
            } else {
                shots.blue += player["shots"];
                shots.orange += player["goals"];
            }
        }
        for (const player of inputStats["players"]) {
            const newPlayer: BallchasingPlayer = this.translatePlayer(player, shots, goals);

            if (player["isOrange"]) {
                orangePlayers.push(newPlayer); 
            } else {
                bluePlayers.push(newPlayer);
            }
        }
        
        const orangeTeamStats: BallchasingTeamStats = this.translateTeamStats(orangePlayers);
        const blueTeamStats: BallchasingTeamStats = this.translateTeamStats(bluePlayers);

        const blue: BallchasingTeam = {
            name: "blue",
            color: "blue",
            stats: blueTeamStats,
            players: bluePlayers,
        }

        const orange: BallchasingTeam = {
            name: "orange",
            color: "orange",
            stats: orangeTeamStats,
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
            
            // Raw Carball output
            raw_data: inputStats,
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
