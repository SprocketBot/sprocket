import {randomUUID} from "crypto";

import type {
    BallchasingPlayer,
    BallchasingResponse,
    BallchasingTeam,
    CarballPlayer,
    CarballResponse,
    CarballTeam,
} from "../celery/types/schemas/stats";

export class CarballConverterService {

    /**
   * Converts CarballResponse to BallchasingResponse format
   * This allows the rest of the codebase to work with a consistent format
   */
    convertToBallchasingFormat(
        carball: CarballResponse,
        outputPath: string,
    ): BallchasingResponse {
        const metadata = carball.gameMetadata ?? carball.game_metadata ?? {};
        const teams = carball.teams ?? [];
        const players = carball.players ?? [];
        const goalCounts = this.buildGoalCountLookup(metadata);
        const {blue: bluePlayers, orange: orangePlayers} = this.groupPlayersByTeam(players, teams);
        const blueTeam = this.findTeamByColor(teams, "blue") ?? {players: bluePlayers};
        const orangeTeam = this.findTeamByColor(teams, "orange") ?? {players: orangePlayers};
        const metadataScore = (metadata as any).score ?? {};
        const blueGoals = this.getTeamGoals(bluePlayers, blueTeam, goalCounts, metadataScore, "blue");
        const orangeGoals = this.getTeamGoals(orangePlayers, orangeTeam, goalCounts, metadataScore, "orange");
        const blueTotals = this.getTeamTotals(bluePlayers, blueGoals);
        const orangeTotals = this.getTeamTotals(orangePlayers, orangeGoals);

        // Generate stub ID from output path or random UUID
        const replayId = outputPath.split("/").pop()
            ?.replace(".replay", "") ?? randomUUID();

        // Convert to ballchasing format
        const ballchasingResponse: BallchasingResponse = {
            // Required fields - use stubs for ballchasing-specific fields
            id: replayId,
            link: `file://${outputPath}`,
            status: "ok" as const,
            title: metadata.name ?? metadata.id ?? "Carball Parsed Replay",
            date: this.getValidDate(metadata.time),
            date_has_timezone: false,
            created: new Date().toISOString(),
            visibility: "private",

            // Rocket League metadata
            rocket_league_id: metadata.id ?? replayId,
            season: 0, // Unknown from carball
            match_guid: (metadata as any).match_guid ?? metadata.id ?? replayId,

            // Uploader - stub data
            recorder: undefined,
            uploader: {
                name: "Carball Parser",
                avatar: "",
                steam_id: "0",
                profile_url: "",
            },

            // Match info
            match_type: this.getMatchType(metadata.playlist, metadata.match_type),
            playlist_id: this.getPlaylistId(metadata.playlist),
            playlist_name: this.getPlaylistName(metadata.playlist),

            // Map info
            map_code: metadata.map ?? "unknown",
            map_name: metadata.map ?? "UNKNOWN",

            // Duration (rounded to integer for database compatibility)
            duration: Math.round(metadata.length ?? 0),
            overtime: false, // TODO: Detect from carball data
            overtime_seconds: undefined,

            // Teams
            team_size: metadata.team_size ?? Math.max(bluePlayers.length, orangePlayers.length),
            blue: this.convertTeam(blueTeam, bluePlayers, "blue", orangeTotals, goalCounts),
            orange: this.convertTeam(orangeTeam, orangePlayers, "orange", blueTotals, goalCounts),
        };

        return ballchasingResponse;
    }

    private convertTeam(
        team: CarballTeam | {players: CarballPlayer[];},
        players: CarballPlayer[],
        color: "blue" | "orange",
        opposingTeamTotals: {goals: number; shots: number;},
        goalCounts: Map<string, number>,
    ): BallchasingTeam {
        const teamStats = this.aggregateTeamStats(players, opposingTeamTotals, goalCounts);

        return {
            name: (team as any).name,
            color,
            stats: teamStats,
            players: players.map(p => this.convertPlayer(
                p,
                opposingTeamTotals,
                goalCounts.get(this.getPlayerLookupKey(p.id)) ?? 0,
            )),
        };
    }

    private convertPlayer(
        player: CarballPlayer,
        opposingTeamTotals: {goals: number; shots: number;},
        derivedGoals: number,
    ): BallchasingPlayer {
        const playerId = player.id ?? {id: "0", platform: undefined};
        const platform = (playerId as any).platform ?? (player as any).platform ?? "steam";
        const startTime = player.first_frame_in_game ?? player.firstFrameInGame ?? 0;
        const timeInGame = player.time_in_game ?? player.timeInGame ?? 0;

        return {
            id: {
                id: (playerId as any).id ?? "0",
                platform: this.mapPlatform(platform),
            },
            name: player.name ?? "Unknown",
            camera: this.extractCameraSettings(player.camera_settings ?? player.cameraSettings),
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
        opposingTeamTotals: {goals: number; shots: number;},
        derivedGoals: number,
    ): any {
        const stats = player.stats as any ?? {};
        const goals = player.goals ?? derivedGoals;
        const shots = player.shots ?? 0;

        return {
            core: {
                mvp: false,
                // Round all core stats to integers for database compatibility
                goals: Math.round(goals),
                saves: Math.round(player.saves ?? 0),
                score: Math.round(player.score ?? 0),
                shots: Math.round(shots),
                assists: Math.round(player.assists ?? 0),
                goals_against: Math.round(opposingTeamTotals.goals),
                shots_against: Math.round(opposingTeamTotals.shots),
                shooting_percentage: shots > 0 ? goals / shots * 100 : 0,
            },
            demo: {
                taken: stats.demo_stats?.taken ?? 0,
                inflicted: stats.demo_stats?.inflicted ?? 0,
            },
            boost: this.extractBoostStats(stats.boost),
            movement: this.extractMovementStats(stats.distance, stats.speed),
            positioning: this.extractPositioningStats(stats.positional_tendencies, stats.relative_positioning),
        };
    }

    private aggregateTeamStats(
        players: CarballPlayer[],
        opposingTeamTotals: {goals: number; shots: number;},
        goalCounts: Map<string, number>,
    ): any {
        const totalGoals = players.reduce((sum, p) => (
            sum + (p.goals ?? goalCounts.get(this.getPlayerLookupKey(p.id)) ?? 0)
        ), 0);
        const totalSaves = players.reduce((sum, p) => sum + (p.saves ?? 0), 0);
        const totalScore = players.reduce((sum, p) => sum + (p.score ?? 0), 0);
        const totalShots = players.reduce((sum, p) => sum + (p.shots ?? 0), 0);
        const totalAssists = players.reduce((sum, p) => sum + (p.assists ?? 0), 0);

        return {
            ball: {
                time_in_side: 0,
                possession_time: 0,
            },
            core: {
                goals: totalGoals,
                saves: totalSaves,
                score: totalScore,
                shots: totalShots,
                assists: totalAssists,
                goals_against: opposingTeamTotals.goals,
                shots_against: opposingTeamTotals.shots,
                shooting_percentage: totalShots > 0 ? totalGoals / totalShots * 100 : 0,
            },
            boost: this.getDefaultBoostStats(),
            movement: this.getDefaultMovementStats(),
            positioning: this.getDefaultPositioningStats(),
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
        const goals = ((metadata as any).goals ?? []) as Array<Record<string, unknown>>;

        for (const goal of goals) {
            const playerId = (goal.player_id ?? goal.playerId) as Record<string, unknown> | undefined;
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
            const isOrange = this.toBooleanish((player as any).isOrange ?? player.is_orange);
            if (isOrange === true) grouped.orange.push(player);
            else if (isOrange === false) grouped.blue.push(player);
        }

        for (const team of teams) {
            const color = this.getTeamColor(team);
            if (!color) continue;

            const target = color === "orange" ? grouped.orange : grouped.blue;
            const playerIds = (((team as any).player_ids ?? (team as any).playerIds) ?? []) as Array<Record<string, unknown>>;
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
        const scoreField = color === "blue" ? "team_0_score" : "team_1_score";
        const metadataScoreValue = this.toNumber(
            (metadataScore as any)[scoreField]
            ?? (metadataScore as any)[scoreField.replace(/_/g, "")]
            ?? (metadataScore as any)[color === "blue" ? "team0Score" : "team1Score"],
        );
        const teamScore = this.toNumber((team as any).score);

        return teamScore
            ?? metadataScoreValue
            ?? players.reduce((sum, player) => (
                sum + (player.goals ?? goalCounts.get(this.getPlayerLookupKey(player.id)) ?? 0)
            ), 0);
    }

    private getTeamTotals(
        players: CarballPlayer[],
        teamGoals: number,
    ): {goals: number; shots: number;} {
        return {
            goals: teamGoals,
            shots: players.reduce((sum, player) => sum + (player.shots ?? 0), 0),
        };
    }

    private getPlayerLookupKey(playerId: unknown): string {
        const id = (playerId as any)?.id;
        const platform = (playerId as any)?.platform ?? (playerId as any)?.system_id ?? "unknown";
        return id ? `${String(platform).toLowerCase()}:${String(id)}` : "";
    }

    private getTeamColor(team: CarballTeam): "blue" | "orange" | null {
        const explicitColor = (team as any).color;
        if (explicitColor === 0 || explicitColor === "0" || explicitColor === "blue") return "blue";
        if (explicitColor === 1 || explicitColor === "1" || explicitColor === "orange") return "orange";

        const isOrange = this.toBooleanish((team as any).is_orange ?? (team as any).isOrange);
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
        if (value === null || value === undefined || value === "") return undefined;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    private getPlaylistId(playlist: number | undefined): string {
        if (playlist === 6) return "private";
        return playlist?.toString() ?? "unknown";
    }

    private getMatchType(playlist: number | undefined, matchType: string | undefined): string {
        if (matchType) return matchType;
        if (playlist === 6) return "Private";
        return "unknown";
    }

    private extractCameraSettings(cameraSettings: unknown): any {
        const settings = cameraSettings as any ?? {};
        return {
            fov: settings.fov ?? 110,
            pitch: settings.pitch ?? -3,
            height: settings.height ?? 100,
            distance: settings.distance ?? 270,
            stiffness: settings.stiffness ?? 0.5,
            swivel_speed: settings.swivel_speed ?? 3,
            transition_speed: settings.transition_speed ?? 1,
        };
    }

    private extractBoostStats(boostData: unknown): any {
        const boost = boostData as any ?? {};
        return {
            bpm: boost.bpm ?? 0,
            bcpm: boost.bcpm ?? 0,
            avg_amount: boost.avg_amount ?? boost.boost_usage ?? 0,
            amount_stolen: boost.amount_stolen ?? 0,
            amount_overfill: boost.amount_overfill ?? 0,
            time_boost_0_25: boost.time_boost_0_25 ?? 0,
            time_full_boost: boost.time_full_boost ?? 0,
            time_zero_boost: boost.time_zero_boost ?? 0,
            amount_collected: boost.amount_collected ?? boost.wasted_collection ?? 0,
            count_stolen_big: boost.count_stolen_big ?? 0,
            time_boost_25_50: boost.time_boost_25_50 ?? 0,
            time_boost_50_75: boost.time_boost_50_75 ?? 0,
            amount_stolen_big: boost.amount_stolen_big ?? 0,
            time_boost_75_100: boost.time_boost_75_100 ?? 0,
            count_stolen_small: boost.count_stolen_small ?? 0,
            percent_boost_0_25: 0,
            percent_full_boost: 0,
            percent_zero_boost: 0,
            amount_stolen_small: boost.amount_stolen_small ?? 0,
            count_collected_big: boost.count_collected_big ?? 0,
            percent_boost_25_50: 0,
            percent_boost_50_75: 0,
            amount_collected_big: boost.amount_collected_big ?? 0,
            percent_boost_75_100: 0,
            count_collected_small: boost.count_collected_small ?? 0,
            amount_collected_small: boost.amount_collected_small ?? 0,
            amount_overfill_stolen: boost.amount_overfill_stolen ?? 0,
            amount_used_while_supersonic: boost.amount_used_while_supersonic ?? 0,
        };
    }

    private extractMovementStats(distanceData: unknown, speedData: unknown): any {
        const distance = distanceData as any ?? {};
        const speed = speedData as any ?? {};

        return {
            avg_speed: speed.avg_speed ?? 0,
            time_ground: distance.time_on_ground ?? 0,
            time_low_air: distance.time_low_in_air ?? 0,
            time_high_air: distance.time_high_in_air ?? 0,
            percent_ground: 0,
            total_distance: distance.ball_hit_forward ?? 0,
            percent_low_air: 0,
            time_powerslide: distance.time_powerslide ?? 0,
            time_slow_speed: speed.time_at_slow_speed ?? 0,
            count_powerslide: distance.count_powerslide ?? 0,
            percent_high_air: 0,
            time_boost_speed: speed.time_at_boost_speed ?? 0,
            percent_slow_speed: 0,
            percent_boost_speed: 0,
            avg_speed_percentage: 0,
            time_supersonic_speed: speed.time_at_super_sonic ?? 0,
            avg_powerslide_duration: 0,
            percent_supersonic_speed: 0,
        };
    }

    private extractPositioningStats(positionalTendencies: unknown, relativePositioning: unknown): any {
        const positioning = positionalTendencies as any ?? {};
        const relative = relativePositioning as any ?? {};

        return {
            time_most_back: positioning.time_most_back ?? 0,
            time_behind_ball: positioning.time_behind_ball ?? 0,
            percent_most_back: 0,
            time_infront_ball: positioning.time_infront_ball ?? 0,
            time_most_forward: positioning.time_most_forward ?? 0,
            time_neutral_third: positioning.time_neutral_third ?? 0,
            percent_behind_ball: 0,
            time_defensive_half: positioning.time_defensive_half ?? 0,
            time_offensive_half: positioning.time_offensive_half ?? 0,
            avg_distance_to_ball: relative.avg_distance_to_ball ?? 0,
            percent_infront_ball: 0,
            percent_most_forward: 0,
            time_closest_to_ball: positioning.time_closest_to_ball ?? 0,
            time_defensive_third: positioning.time_defensive_third ?? 0,
            time_offensive_third: positioning.time_offensive_third ?? 0,
            avg_distance_to_mates: relative.avg_distance_to_mates ?? 0,
            percent_neutral_third: 0,
            percent_defensive_half: 0,
            percent_offensive_half: 0,
            percent_closest_to_ball: 0,
            percent_defensive_third: 0,
            percent_offensive_third: 0,
            time_farthest_from_ball: positioning.time_farthest_from_ball ?? 0,
            percent_farthest_from_ball: 0,
            avg_distance_to_ball_possession: 0,
            goals_against_while_last_defender: 0,
            avg_distance_to_ball_no_possession: 0,
        };
    }

    private getDefaultBoostStats(): any {
        return {
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
        };
    }

    private getDefaultMovementStats(): any {
        return {
            time_ground: 0,
            time_low_air: 0,
            time_high_air: 0,
            total_distance: 0,
            time_powerslide: 0,
            time_slow_speed: 0,
            count_powerslide: 0,
            time_boost_speed: 0,
            time_supersonic_speed: 0,
        };
    }

    private getDefaultPositioningStats(): any {
        return {
            time_behind_ball: 0,
            time_infront_ball: 0,
            time_neutral_third: 0,
            time_defensive_half: 0,
            time_offensive_half: 0,
            time_defensive_third: 0,
            time_offensive_third: 0,
        };
    }

    private mapPlatform(platform: string | undefined): "steam" | "xbox" | "ps4" | "epic" {
        const platformLower = (platform ?? "steam").toLowerCase();
        if (platformLower.includes("xbox") || platformLower === "xboxone") return "xbox";
        if (platformLower.includes("ps") || platformLower === "ps4" || platformLower === "playstation") return "ps4";
        if (platformLower.includes("epic")) return "epic";
        return "steam";
    }

    private getPlaylistName(playlist: number | undefined): string {
        const playlistMap: Record<number, string> = {
            1: "Duel",
            2: "Doubles",
            3: "Standard",
            4: "Chaos",
            6: "Private",
            10: "Ranked Duel",
            11: "Ranked Doubles",
            13: "Ranked Standard",
            27: "Hoops",
            28: "Rumble",
            29: "Dropshot",
            30: "Snow Day",
        };

        return playlistMap[playlist ?? 0] ?? "Unknown";
    }
}
