import {createHash} from "crypto";

import type {
    BallchasingPlayer,
    BallchasingResponse,
    BallchasingTeam,
    CarballPlayer,
    CarballResponse,
    CarballTeam,
} from "../celery/types/schemas/stats";

type TeamTotals = {goals: number; shots: number;};

export class CarballConverterService {

    convertToBallchasingFormat(
        carball: CarballResponse,
        outputPath: string,
    ): BallchasingResponse {
        const metadata = this.asRecord(carball.gameMetadata ?? carball.game_metadata);
        const teams = carball.teams ?? [];
        const players = carball.players ?? [];
        const goalCounts = this.buildGoalCountLookup(metadata);
        const {blue: bluePlayers, orange: orangePlayers} = this.groupPlayersByTeam(players, teams);
        const blueTeam = this.findTeamByColor(teams, "blue") ?? {players: bluePlayers};
        const orangeTeam = this.findTeamByColor(teams, "orange") ?? {players: orangePlayers};
        const metadataScore = this.asRecord(this.getField(metadata, "score"));
        const blueGoals = this.getTeamGoals(bluePlayers, blueTeam, goalCounts, metadataScore, "blue");
        const orangeGoals = this.getTeamGoals(orangePlayers, orangeTeam, goalCounts, metadataScore, "orange");
        const blueTotals = this.getTeamTotals(bluePlayers, blueGoals);
        const orangeTotals = this.getTeamTotals(orangePlayers, orangeGoals);
        const replayId = this.buildReplayId(outputPath);
        const playlist = this.getField(metadata, "playlist");
        const matchType = this.getField(metadata, "match_type", "matchType");
        const overtimeSeconds = this.toNumber(this.getField(metadata, "overtime_seconds", "overtimeSeconds"));

        return {
            id: replayId,
            link: `file://${outputPath}`,
            status: "ok" as const,
            title: this.getOptionalString(this.getField(metadata, "name", "id")) ?? "Carball Parsed Replay",
            date: this.getValidDate(this.getField(metadata, "time")),
            date_has_timezone: false,
            created: new Date().toISOString(),
            visibility: "private",
            rocket_league_id: this.getOptionalString(this.getField(metadata, "id")) ?? replayId,
            season: 0,
            match_guid: this.getOptionalString(this.getField(metadata, "match_guid", "matchGuid", "id")) ?? replayId,
            recorder: undefined,
            uploader: {
                name: "Carball Parser",
                avatar: "",
                steam_id: "0",
                profile_url: "",
            },
            match_type: this.getMatchType(playlist, matchType),
            playlist_id: this.getPlaylistId(playlist),
            playlist_name: this.getPlaylistName(playlist),
            map_code: this.getOptionalString(this.getField(metadata, "map")) ?? "unknown",
            map_name: this.getOptionalString(this.getField(metadata, "map")) ?? "UNKNOWN",
            duration: Math.round(this.toNumber(this.getField(metadata, "length")) ?? 0),
            overtime: Boolean(overtimeSeconds && overtimeSeconds > 0),
            overtime_seconds: overtimeSeconds,
            team_size: this.toNumber(this.getField(metadata, "team_size", "teamSize"))
                ?? Math.max(bluePlayers.length, orangePlayers.length),
            blue: this.convertTeam(blueTeam, bluePlayers, "blue", orangeTotals, goalCounts),
            orange: this.convertTeam(orangeTeam, orangePlayers, "orange", blueTotals, goalCounts),
        };
    }

    private buildReplayId(outputPath: string): string {
        if (!outputPath) return createHash("sha256").update("missing-output-path").digest("hex");
        return createHash("sha256").update(outputPath).digest("hex");
    }

    private asRecord(value: unknown): Record<string, unknown> {
        return value && typeof value === "object" ? value as Record<string, unknown> : {};
    }

    private getField(source: unknown, ...candidates: Array<string | string[]>): unknown {
        const root = this.asRecord(source);

        for (const candidate of candidates) {
            const path = Array.isArray(candidate) ? candidate : [candidate];
            let current: unknown = root;

            for (const segment of path) {
                if (!current || typeof current !== "object" || !(segment in (current as Record<string, unknown>))) {
                    current = undefined;
                    break;
                }
                current = (current as Record<string, unknown>)[segment];
            }

            if (current !== undefined) return current;
        }

        return undefined;
    }

    private getOptionalString(value: unknown): string | undefined {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    private convertTeam(
        team: CarballTeam | {players: CarballPlayer[];},
        players: CarballPlayer[],
        color: "blue" | "orange",
        opposingTeamTotals: TeamTotals,
        goalCounts: Map<string, number>,
    ): BallchasingTeam {
        const convertedPlayers = players.map(player => this.convertPlayer(
            player,
            opposingTeamTotals,
            goalCounts.get(this.getPlayerLookupKey(player.id)) ?? 0,
        ));

        return {
            name: this.getOptionalString((team as any).name),
            color,
            stats: this.aggregateTeamStats(team, players, convertedPlayers, opposingTeamTotals, goalCounts),
            players: convertedPlayers,
        };
    }

    private convertPlayer(
        player: CarballPlayer,
        opposingTeamTotals: TeamTotals,
        derivedGoals: number,
    ): BallchasingPlayer {
        const playerId = this.asRecord(player.id);
        const platform = this.getOptionalString(this.getField(playerId, "platform"))
            ?? this.getOptionalString(this.getField(player, "platform"))
            ?? "steam";
        const startTime = this.toNumber(this.getField(player, "first_frame_in_game", "firstFrameInGame")) ?? 0;
        const timeInGame = this.toNumber(this.getField(player, "time_in_game", "timeInGame")) ?? 0;

        return {
            id: {
                id: this.getOptionalString(this.getField(playerId, "id")) ?? "0",
                platform: this.mapPlatform(platform),
            },
            name: this.getOptionalString(this.getField(player, "name")) ?? "Unknown",
            camera: this.extractCameraSettings(this.getField(player, "camera_settings", "cameraSettings")),
            car_id: -1,
            car_name: "UNKNOWN",
            start_time: startTime,
            end_time: startTime + timeInGame,
            steering_sensitivity: 1.0,
            stats: this.convertPlayerStats(player, opposingTeamTotals, derivedGoals),
        };
    }

    private convertPlayerStats(
        player: CarballPlayer,
        opposingTeamTotals: TeamTotals,
        derivedGoals: number,
    ): BallchasingPlayer["stats"] {
        const stats = this.asRecord(player.stats);
        const hitCounts = this.asRecord(this.getField(stats, "hit_counts", "hitCounts"));
        const goals = this.toNumber(this.getField(player, "goals")) ?? derivedGoals;
        const shots = this.toNumber(this.getField(player, "shots"))
            ?? this.toNumber(this.getField(hitCounts, "total_shots", "totalShots"))
            ?? 0;
        const assists = this.toNumber(this.getField(player, "assists")) ?? 0;
        const saves = this.toNumber(this.getField(player, "saves"))
            ?? this.toNumber(this.getField(hitCounts, "total_saves", "totalSaves"))
            ?? 0;
        const score = this.toNumber(this.getField(player, "score")) ?? 0;
        const timeInGame = this.toNumber(this.getField(player, "time_in_game", "timeInGame")) ?? 0;

        return {
            core: {
                mvp: false,
                goals: Math.round(goals),
                saves: Math.round(saves),
                score: Math.round(score),
                shots: Math.round(shots),
                assists: Math.round(assists),
                goals_against: Math.round(opposingTeamTotals.goals),
                shots_against: Math.round(opposingTeamTotals.shots),
                shooting_percentage: this.calculatePercentage(goals, shots),
            },
            demo: {
                taken: this.toNumber(this.getField(stats, ["demo_stats", "taken"], ["demoStats", "taken"])) ?? 0,
                inflicted: this.toNumber(this.getField(stats, ["demo_stats", "inflicted"], ["demoStats", "inflicted"])) ?? 0,
            },
            boost: this.extractBoostStats(this.getField(stats, "boost"), timeInGame),
            movement: this.extractMovementStats(
                this.getField(stats, "distance"),
                this.getField(stats, "speed"),
                this.getField(stats, "positional_tendencies", "positionalTendencies"),
                this.getField(stats, "averages"),
            ),
            positioning: this.extractPositioningStats(
                this.getField(stats, "positional_tendencies", "positionalTendencies"),
                this.getField(stats, "relative_positioning", "relativePositioning"),
            ),
        };
    }

    private aggregateTeamStats(
        team: CarballTeam | {players: CarballPlayer[];},
        rawPlayers: CarballPlayer[],
        players: BallchasingPlayer[],
        opposingTeamTotals: TeamTotals,
        goalCounts: Map<string, number>,
    ): BallchasingTeam["stats"] {
        const teamStats = this.asRecord((team as any).stats);
        const teamPossession = this.toNumber(this.getField(teamStats, ["possession", "possession_time"], ["possession", "possessionTime"]));
        const playerStats = players.map(player => player.stats);
        const totalGoals = rawPlayers.reduce((sum, player) => (
            sum + (this.toNumber(this.getField(player, "goals")) ?? goalCounts.get(this.getPlayerLookupKey(player.id)) ?? 0)
        ), 0);
        const totalSaves = playerStats.reduce((sum, stats) => sum + stats.core.saves, 0);
        const totalScore = playerStats.reduce((sum, stats) => sum + stats.core.score, 0);
        const totalShots = playerStats.reduce((sum, stats) => sum + stats.core.shots, 0);
        const totalAssists = playerStats.reduce((sum, stats) => sum + stats.core.assists, 0);

        return {
            ball: {
                time_in_side: 0,
                possession_time: teamPossession ?? 0,
            },
            core: {
                goals: totalGoals,
                saves: totalSaves,
                score: totalScore,
                shots: totalShots,
                assists: totalAssists,
                goals_against: opposingTeamTotals.goals,
                shots_against: opposingTeamTotals.shots,
                shooting_percentage: this.calculatePercentage(totalGoals, totalShots),
            },
            boost: {
                bpm: this.sumNumbers(playerStats.map(stats => stats.boost.bpm)),
                bcpm: this.sumNumbers(playerStats.map(stats => stats.boost.bcpm)),
                avg_amount: this.averageNumbers(playerStats.map(stats => stats.boost.avg_amount)),
                amount_stolen: this.sumNumbers(playerStats.map(stats => stats.boost.amount_stolen)),
                amount_overfill: this.sumNumbers(playerStats.map(stats => stats.boost.amount_overfill)),
                time_boost_0_25: this.sumNumbers(playerStats.map(stats => stats.boost.time_boost_0_25)),
                time_full_boost: this.sumNumbers(playerStats.map(stats => stats.boost.time_full_boost)),
                time_zero_boost: this.sumNumbers(playerStats.map(stats => stats.boost.time_zero_boost)),
                amount_collected: this.sumNumbers(playerStats.map(stats => stats.boost.amount_collected)),
                count_stolen_big: this.sumNumbers(playerStats.map(stats => stats.boost.count_stolen_big)),
                time_boost_25_50: this.sumNumbers(playerStats.map(stats => stats.boost.time_boost_25_50)),
                time_boost_50_75: this.sumNumbers(playerStats.map(stats => stats.boost.time_boost_50_75)),
                amount_stolen_big: this.sumNumbers(playerStats.map(stats => stats.boost.amount_stolen_big)),
                time_boost_75_100: this.sumNumbers(playerStats.map(stats => stats.boost.time_boost_75_100)),
                count_stolen_small: this.sumNumbers(playerStats.map(stats => stats.boost.count_stolen_small)),
                amount_stolen_small: this.sumNumbers(playerStats.map(stats => stats.boost.amount_stolen_small)),
                count_collected_big: this.sumNumbers(playerStats.map(stats => stats.boost.count_collected_big)),
                amount_collected_big: this.sumNumbers(playerStats.map(stats => stats.boost.amount_collected_big)),
                count_collected_small: this.sumNumbers(playerStats.map(stats => stats.boost.count_collected_small)),
                amount_collected_small: this.sumNumbers(playerStats.map(stats => stats.boost.amount_collected_small)),
                amount_overfill_stolen: this.sumNumbers(playerStats.map(stats => stats.boost.amount_overfill_stolen)),
                amount_used_while_supersonic: this.sumNumbers(playerStats.map(stats => stats.boost.amount_used_while_supersonic)),
            },
            movement: {
                time_ground: this.sumNumbers(playerStats.map(stats => stats.movement.time_ground)),
                time_low_air: this.sumNumbers(playerStats.map(stats => stats.movement.time_low_air)),
                time_high_air: this.sumNumbers(playerStats.map(stats => stats.movement.time_high_air)),
                total_distance: this.sumNumbers(playerStats.map(stats => stats.movement.total_distance)),
                time_powerslide: this.sumNumbers(playerStats.map(stats => stats.movement.time_powerslide)),
                time_slow_speed: this.sumNumbers(playerStats.map(stats => stats.movement.time_slow_speed)),
                count_powerslide: this.sumNumbers(playerStats.map(stats => stats.movement.count_powerslide)),
                time_boost_speed: this.sumNumbers(playerStats.map(stats => stats.movement.time_boost_speed)),
                time_supersonic_speed: this.sumNumbers(playerStats.map(stats => stats.movement.time_supersonic_speed)),
            },
            positioning: {
                time_behind_ball: this.sumNumbers(playerStats.map(stats => stats.positioning.time_behind_ball)),
                time_infront_ball: this.sumNumbers(playerStats.map(stats => stats.positioning.time_infront_ball)),
                time_neutral_third: this.sumNumbers(playerStats.map(stats => stats.positioning.time_neutral_third)),
                time_defensive_half: this.sumNumbers(playerStats.map(stats => stats.positioning.time_defensive_half)),
                time_offensive_half: this.sumNumbers(playerStats.map(stats => stats.positioning.time_offensive_half)),
                time_defensive_third: this.sumNumbers(playerStats.map(stats => stats.positioning.time_defensive_third)),
                time_offensive_third: this.sumNumbers(playerStats.map(stats => stats.positioning.time_offensive_third)),
            },
        };
    }

    private getValidDate(dateValue: unknown): string {
        if (dateValue === null || dateValue === undefined || dateValue === "") {
            return new Date().toISOString();
        }

        if (typeof dateValue === "number" || /^\d+$/.test(String(dateValue))) {
            const rawValue = Number(dateValue);
            const timestamp = rawValue > 1_000_000_000_000 ? rawValue : rawValue * 1000;
            const parsed = new Date(timestamp);
            return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        }

        const parsed = new Date(String(dateValue));
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    }

    private buildGoalCountLookup(metadata: Record<string, unknown>): Map<string, number> {
        const goalCounts = new Map<string, number>();
        const goals = (this.getField(metadata, "goals") as Array<Record<string, unknown>> | undefined) ?? [];

        for (const goal of goals) {
            const playerId = (this.getField(goal, "player_id", "playerId") as Record<string, unknown> | undefined);
            const key = this.getPlayerLookupKey(playerId);
            if (!key) continue;
            goalCounts.set(key, (goalCounts.get(key) ?? 0) + 1);
        }

        return goalCounts;
    }

    private groupPlayersByTeam(
        players: CarballPlayer[],
        teams: CarballTeam[],
    ): {blue: CarballPlayer[]; orange: CarballPlayer[];} {
        const playerByKey = new Map(players.map(player => [this.getPlayerLookupKey(player.id), player]));
        const grouped = {
            blue: [] as CarballPlayer[],
            orange: [] as CarballPlayer[],
        };

        for (const player of players) {
            const isOrange = this.toBooleanish(this.getField(player, "isOrange", "is_orange"));
            if (isOrange === true) grouped.orange.push(player);
            else if (isOrange === false) grouped.blue.push(player);
        }

        for (const team of teams) {
            const color = this.getTeamColor(team);
            if (!color) continue;

            const target = color === "orange" ? grouped.orange : grouped.blue;
            const playerIds = (this.getField(team, "player_ids", "playerIds") as Array<Record<string, unknown>> | undefined) ?? [];
            for (const playerId of playerIds) {
                const key = this.getPlayerLookupKey(playerId);
                if (!key) continue;
                const player = playerByKey.get(key);
                if (player && !target.some(existing => this.getPlayerLookupKey(existing.id) === key)) {
                    target.push(player);
                }
            }
        }

        for (const player of players) {
            const key = this.getPlayerLookupKey(player.id);
            if (
                !grouped.blue.some(existing => this.getPlayerLookupKey(existing.id) === key)
                && !grouped.orange.some(existing => this.getPlayerLookupKey(existing.id) === key)
            ) {
                grouped.blue.push(player);
            }
        }

        return grouped;
    }

    private findTeamByColor(teams: CarballTeam[], color: "blue" | "orange"): CarballTeam | undefined {
        return teams.find(team => this.getTeamColor(team) === color);
    }

    private getTeamGoals(
        players: CarballPlayer[],
        team: CarballTeam | {players: CarballPlayer[];},
        goalCounts: Map<string, number>,
        metadataScore: Record<string, unknown>,
        color: "blue" | "orange",
    ): number {
        const metadataScoreValue = this.toNumber(
            color === "blue"
                ? this.getField(metadataScore, "team_0_score", "team0Score")
                : this.getField(metadataScore, "team_1_score", "team1Score"),
        );
        const teamScore = this.toNumber(this.getField(team, "score"));

        return teamScore
            ?? metadataScoreValue
            ?? players.reduce((sum, player) => (
                sum + (this.toNumber(this.getField(player, "goals")) ?? goalCounts.get(this.getPlayerLookupKey(player.id)) ?? 0)
            ), 0);
    }

    private getTeamTotals(
        players: CarballPlayer[],
        teamGoals: number,
    ): TeamTotals {
        return {
            goals: teamGoals,
            shots: players.reduce((sum, player) => (
                sum
                + (this.toNumber(this.getField(player, "shots"))
                ?? this.toNumber(this.getField(player.stats, ["hit_counts", "total_shots"], ["hitCounts", "totalShots"]))
                ?? 0)
            ), 0),
        };
    }

    private getPlayerLookupKey(playerId: unknown): string {
        const id = this.getOptionalString(this.getField(playerId, "id"));
        if (!id) return "";
        const platform = this.getOptionalString(this.getField(playerId, "platform"));
        return platform ? `${platform}:${id}` : id;
    }

    private getTeamColor(team: CarballTeam): "blue" | "orange" | null {
        const explicitColor = this.getField(team, "color");
        if (explicitColor === 0 || explicitColor === "0" || explicitColor === "blue") return "blue";
        if (explicitColor === 1 || explicitColor === "1" || explicitColor === "orange") return "orange";

        const isOrange = this.toBooleanish(this.getField(team, "is_orange", "isOrange"));
        if (isOrange === true) return "orange";
        if (isOrange === false) return "blue";

        return null;
    }

    private toBooleanish(value: unknown): boolean | null {
        if (value === null || value === undefined) return null;
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value !== 0;
        if (typeof value === "string") {
            const normalized = value.toLowerCase();
            if (normalized === "true" || normalized === "1") return true;
            if (normalized === "false" || normalized === "0") return false;
        }
        return null;
    }

    private toNumber(value: unknown): number | undefined {
        if (value === null || value === undefined || value === "" || value === "NaN") return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    private calculatePercentage(numerator: number, denominator: number): number {
        return denominator > 0 ? numerator / denominator * 100 : 0;
    }

    private sumNumbers(values: number[]): number {
        return values.reduce((sum, value) => sum + value, 0);
    }

    private averageNumbers(values: number[]): number {
        if (values.length === 0) return 0;
        return this.sumNumbers(values) / values.length;
    }

    private normalizePlaylist(playlist: unknown): string {
        const numeric = this.toNumber(playlist);
        if (numeric !== undefined) return String(numeric);
        return String(playlist ?? "").trim().toUpperCase();
    }

    private getPlaylistId(playlist: unknown): string {
        const normalized = this.normalizePlaylist(playlist);
        if (normalized === "6" || normalized === "CUSTOM_LOBBY" || normalized === "PRIVATE") return "private";
        return normalized || "unknown";
    }

    private getMatchType(playlist: unknown, matchType: unknown): string {
        const explicitMatchType = this.getOptionalString(matchType);
        if (explicitMatchType) return explicitMatchType;
        if (this.getPlaylistId(playlist) === "private") return "Private";
        return "unknown";
    }

    private extractCameraSettings(cameraSettings: unknown): BallchasingPlayer["camera"] {
        return {
            fov: this.toNumber(this.getField(cameraSettings, "fov", "fieldOfView")) ?? 110,
            pitch: this.toNumber(this.getField(cameraSettings, "pitch")) ?? -3,
            height: this.toNumber(this.getField(cameraSettings, "height")) ?? 100,
            distance: this.toNumber(this.getField(cameraSettings, "distance")) ?? 270,
            stiffness: this.toNumber(this.getField(cameraSettings, "stiffness")) ?? 0.5,
            swivel_speed: this.toNumber(this.getField(cameraSettings, "swivel_speed", "swivelSpeed")) ?? 3,
            transition_speed: this.toNumber(this.getField(cameraSettings, "transition_speed", "transitionSpeed")) ?? 1,
        };
    }

    private extractBoostStats(boostData: unknown, timeInGame: number): BallchasingPlayer["stats"]["boost"] {
        const averageBoostLevel = this.toNumber(this.getField(boostData, "avg_amount", "averageBoostLevel")) ?? 0;
        const amountCollected = this.toNumber(this.getField(boostData, "amount_collected", "amountCollected", "boostUsage")) ?? 0;
        const perMinute = timeInGame > 0 ? amountCollected / timeInGame * 60 : 0;

        return {
            bpm: this.toNumber(this.getField(boostData, "bpm")) ?? perMinute,
            bcpm: this.toNumber(this.getField(boostData, "bcpm")) ?? perMinute,
            avg_amount: averageBoostLevel,
            amount_stolen: this.toNumber(this.getField(boostData, "amount_stolen", "amountStolen")) ?? 0,
            amount_overfill: this.toNumber(this.getField(boostData, "amount_overfill", "amountOverfill", "wastedCollection")) ?? 0,
            time_boost_0_25: this.toNumber(this.getField(boostData, "time_boost_0_25", "timeLowBoost")) ?? 0,
            time_full_boost: this.toNumber(this.getField(boostData, "time_full_boost", "timeFullBoost")) ?? 0,
            time_zero_boost: this.toNumber(this.getField(boostData, "time_zero_boost", "timeNoBoost")) ?? 0,
            amount_collected: amountCollected,
            count_stolen_big: this.toNumber(this.getField(boostData, "count_stolen_big", "numStolenBoosts")) ?? 0,
            time_boost_25_50: this.toNumber(this.getField(boostData, "time_boost_25_50")) ?? 0,
            time_boost_50_75: this.toNumber(this.getField(boostData, "time_boost_50_75")) ?? 0,
            amount_stolen_big: this.toNumber(this.getField(boostData, "amount_stolen_big")) ?? 0,
            time_boost_75_100: this.toNumber(this.getField(boostData, "time_boost_75_100")) ?? 0,
            count_stolen_small: this.toNumber(this.getField(boostData, "count_stolen_small")) ?? 0,
            percent_boost_0_25: 0,
            percent_full_boost: 0,
            percent_zero_boost: 0,
            amount_stolen_small: this.toNumber(this.getField(boostData, "amount_stolen_small")) ?? 0,
            count_collected_big: this.toNumber(this.getField(boostData, "count_collected_big")) ?? 0,
            percent_boost_25_50: 0,
            percent_boost_50_75: 0,
            amount_collected_big: this.toNumber(this.getField(boostData, "amount_collected_big")) ?? 0,
            percent_boost_75_100: 0,
            count_collected_small: this.toNumber(this.getField(boostData, "count_collected_small")) ?? 0,
            amount_collected_small: this.toNumber(this.getField(boostData, "amount_collected_small")) ?? 0,
            amount_overfill_stolen: this.toNumber(this.getField(boostData, "amount_overfill_stolen")) ?? 0,
            amount_used_while_supersonic: this.toNumber(this.getField(boostData, "amount_used_while_supersonic", "wastedUsage")) ?? 0,
        };
    }

    private extractMovementStats(
        distanceData: unknown,
        speedData: unknown,
        positionalTendencies: unknown,
        averagesData: unknown,
    ): BallchasingPlayer["stats"]["movement"] {
        const rawAvgSpeed = this.toNumber(this.getField(speedData, "avg_speed", "averageSpeed"))
            ?? this.toNumber(this.getField(averagesData, "averageSpeed", "average_speed"))
            ?? 0;
        const avgSpeed = rawAvgSpeed > 3000 ? rawAvgSpeed / 10 : rawAvgSpeed;
        const totalDistance = this.toNumber(this.getField(distanceData, "total_distance", "totalDistance"))
            ?? (
                (this.toNumber(this.getField(distanceData, "ball_hit_forward", "ballHitForward")) ?? 0)
                + (this.toNumber(this.getField(distanceData, "ball_hit_backward", "ballHitBackward")) ?? 0)
            );

        return {
            avg_speed: avgSpeed,
            time_ground: this.toNumber(this.getField(positionalTendencies, "time_on_ground", "timeOnGround")) ?? 0,
            time_low_air: this.toNumber(this.getField(positionalTendencies, "time_low_in_air", "timeLowInAir")) ?? 0,
            time_high_air: this.toNumber(this.getField(positionalTendencies, "time_high_in_air", "timeHighInAir")) ?? 0,
            percent_ground: 0,
            total_distance: totalDistance,
            percent_low_air: 0,
            time_powerslide: this.toNumber(this.getField(distanceData, "time_powerslide", "timePowerslide")) ?? 0,
            time_slow_speed: this.toNumber(this.getField(speedData, "time_at_slow_speed", "timeAtSlowSpeed")) ?? 0,
            count_powerslide: this.toNumber(this.getField(distanceData, "count_powerslide", "countPowerslide")) ?? 0,
            percent_high_air: 0,
            time_boost_speed: this.toNumber(this.getField(speedData, "time_at_boost_speed", "timeAtBoostSpeed")) ?? 0,
            percent_slow_speed: 0,
            percent_boost_speed: 0,
            avg_speed_percentage: 0,
            time_supersonic_speed: this.toNumber(this.getField(speedData, "time_at_super_sonic", "timeAtSuperSonic")) ?? 0,
            avg_powerslide_duration: 0,
            percent_supersonic_speed: 0,
        };
    }

    private extractPositioningStats(
        positionalTendencies: unknown,
        relativePositioning: unknown,
    ): BallchasingPlayer["stats"]["positioning"] {
        return {
            time_most_back: this.toNumber(this.getField(relativePositioning, "time_behind_center_of_mass", "timeBehindCenterOfMass")) ?? 0,
            time_behind_ball: this.toNumber(this.getField(positionalTendencies, "time_behind_ball", "timeBehindBall")) ?? 0,
            percent_most_back: 0,
            time_infront_ball: this.toNumber(this.getField(positionalTendencies, "time_in_front_ball", "timeInFrontBall")) ?? 0,
            time_most_forward: this.toNumber(this.getField(relativePositioning, "time_in_front_of_center_of_mass", "timeInFrontOfCenterOfMass")) ?? 0,
            time_neutral_third: this.toNumber(this.getField(positionalTendencies, "time_neutral_third", "timeInNeutralThird")) ?? 0,
            percent_behind_ball: 0,
            time_defensive_half: this.toNumber(this.getField(positionalTendencies, "time_defensive_half", "timeInDefendingHalf")) ?? 0,
            time_offensive_half: this.toNumber(this.getField(positionalTendencies, "time_offensive_half", "timeInAttackingHalf")) ?? 0,
            avg_distance_to_ball: this.toNumber(this.getField(relativePositioning, "avg_distance_to_ball", "avgDistanceToBall")) ?? 0,
            percent_infront_ball: 0,
            percent_most_forward: 0,
            time_closest_to_ball: this.toNumber(this.getField(positionalTendencies, "time_closest_to_ball", "timeClosestToBall")) ?? 0,
            time_defensive_third: this.toNumber(this.getField(positionalTendencies, "time_defensive_third", "timeInDefendingThird")) ?? 0,
            time_offensive_third: this.toNumber(this.getField(positionalTendencies, "time_offensive_third", "timeInAttackingThird")) ?? 0,
            avg_distance_to_mates: this.toNumber(this.getField(relativePositioning, "avg_distance_to_mates", "avgDistanceToMates")) ?? 0,
            percent_neutral_third: 0,
            percent_defensive_half: 0,
            percent_offensive_half: 0,
            percent_closest_to_ball: 0,
            percent_defensive_third: 0,
            percent_offensive_third: 0,
            time_farthest_from_ball: this.toNumber(this.getField(positionalTendencies, "time_farthest_from_ball", "timeFurthestFromBall")) ?? 0,
            percent_farthest_from_ball: 0,
            avg_distance_to_ball_possession: 0,
            goals_against_while_last_defender: 0,
            avg_distance_to_ball_no_possession: 0,
        };
    }

    private mapPlatform(platform: string | undefined): "steam" | "xbox" | "ps4" | "epic" {
        const platformLower = (platform ?? "steam").toLowerCase();
        if (platformLower.includes("xbox") || platformLower === "xboxone") return "xbox";
        if (platformLower.includes("ps") || platformLower === "ps4" || platformLower === "playstation") return "ps4";
        if (platformLower.includes("epic")) return "epic";
        return "steam";
    }

    private getPlaylistName(playlist: unknown): string {
        const normalized = this.normalizePlaylist(playlist);
        const playlistMap: Record<string, string> = {
            "1": "Duel",
            "2": "Doubles",
            "3": "Standard",
            "4": "Chaos",
            "6": "Private",
            "10": "Ranked Duel",
            "11": "Ranked Doubles",
            "13": "Ranked Standard",
            "27": "Hoops",
            "28": "Rumble",
            "29": "Dropshot",
            "30": "Snow Day",
            CUSTOM_LOBBY: "Private",
            PRIVATE: "Private",
            RANKED_DUEL: "Ranked Duel",
            RANKED_DOUBLES: "Ranked Doubles",
            RANKED_STANDARD: "Ranked Standard",
            DOUBLES: "Doubles",
            DUEL: "Duel",
            STANDARD: "Standard",
        };

        return playlistMap[normalized] ?? "Unknown";
    }
}
