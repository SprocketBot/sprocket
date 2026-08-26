import {CarballConverterService, Parser} from "@sprocketbot/common";

import {StatsConverterService} from "./stats-converter.service";

const SUMMARY_ONLY_CARBALL_REPLAY = {
    game_metadata: {
        id: "summary-only-replay",
        name: "Summary Only Replay",
        map: "dfh_stadium",
        time: "1710000000",
        length: 300,
        team_size: 2,
        playlist: 6,
        match_guid: "summary-match-guid",
        score: {
            team_0_score: 2,
            team_1_score: 1,
        },
        goals: [
            {player_id: {id: "blue-1", platform: "steam"} },
            {player_id: {id: "orange-1", platform: "epic"} },
            {player_id: {id: "blue-1", platform: "steam"} },
        ],
    },
    players: [
        {id: {id: "blue-1", platform: "steam"}, name: "Blue One", is_orange: 0},
        {id: {id: "blue-2", platform: "steam"}, name: "Blue Two", is_orange: 0},
        {id: {id: "orange-1", platform: "epic"}, name: "Orange One", is_orange: 1},
        {id: {id: "orange-2", platform: "epic"}, name: "Orange Two", is_orange: 1},
    ],
    teams: [
        {
            is_orange: false,
            score: 2,
            player_ids: [
                {id: "blue-1", platform: "steam"},
                {id: "blue-2", platform: "steam"},
            ],
        },
        {
            is_orange: true,
            score: 1,
            player_ids: [
                {id: "orange-1", platform: "epic"},
                {id: "orange-2", platform: "epic"},
            ],
        },
    ],
};

const FULL_ANALYSIS_CARBALL_REPLAY = {
    gameMetadata: {
        id: "full-analysis-replay",
        name: "Full Analysis Replay",
        map: "eurostadium_night_p",
        time: "1710000000",
        length: 300.2,
        teamSize: 2,
        playlist: "CUSTOM_LOBBY",
        matchGuid: "full-analysis-match-guid",
        score: {
            team0Score: 2,
            team1Score: 1,
        },
        goals: [
            {playerId: {id: "blue-1", platform: "OnlinePlatform_Steam"} },
            {playerId: {id: "orange-1", platform: "OnlinePlatform_Epic"} },
            {playerId: {id: "blue-1", platform: "OnlinePlatform_Steam"} },
        ],
    },
    players: [
        {
            id: {id: "blue-1", platform: "OnlinePlatform_Steam"},
            name: "Blue One",
            goals: 2,
            shots: 3,
            assists: 1,
            saves: 2,
            score: 620,
            isOrange: 0,
            platform: "OnlinePlatform_Steam",
            firstFrameInGame: 4,
            timeInGame: 296,
            cameraSettings: {
                fieldOfView: 108,
                pitch: -4,
                height: 110,
                distance: 280,
                stiffness: 0.45,
                swivelSpeed: 4.5,
                transitionSpeed: 1.3,
            },
            stats: {
                boost: {
                    boostUsage: 1200,
                    averageBoostLevel: 42,
                    timeLowBoost: 30,
                    timeNoBoost: 12,
                    timeFullBoost: 18,
                },
                distance: {
                    ballHitForward: 1400,
                    ballHitBackward: 250,
                    timeClosestToBall: 15,
                    timeFurthestFromBall: 18,
                },
                positionalTendencies: {
                    timeOnGround: 180,
                    timeLowInAir: 70,
                    timeHighInAir: 12,
                    timeBehindBall: 160,
                    timeInFrontBall: 60,
                    timeInDefendingHalf: 130,
                    timeInAttackingHalf: 110,
                    timeInDefendingThird: 70,
                    timeInNeutralThird: 65,
                    timeInAttackingThird: 60,
                },
                averages: {
                    averageSpeed: 15000,
                },
                speed: {
                    timeAtSlowSpeed: 20,
                    timeAtBoostSpeed: 110,
                    timeAtSuperSonic: 40,
                },
                relativePositioning: {
                    timeBehindCenterOfMass: 120,
                    timeInFrontOfCenterOfMass: 90,
                },
            },
        },
        {
            id: {id: "blue-2", platform: "OnlinePlatform_Steam"},
            name: "Blue Two",
            goals: 0,
            shots: 1,
            assists: 0,
            saves: 1,
            score: 320,
            isOrange: 0,
            platform: "OnlinePlatform_Steam",
            firstFrameInGame: 4,
            timeInGame: 296,
            stats: {},
        },
        {
            id: {id: "orange-1", platform: "OnlinePlatform_Epic"},
            name: "Orange One",
            goals: 1,
            shots: 2,
            assists: 0,
            saves: 1,
            score: 410,
            isOrange: 1,
            platform: "OnlinePlatform_Epic",
            firstFrameInGame: 4,
            timeInGame: 296,
            stats: {},
        },
        {
            id: {id: "orange-2", platform: "OnlinePlatform_Epic"},
            name: "Orange Two",
            goals: 0,
            shots: 1,
            assists: 0,
            saves: 0,
            score: 180,
            isOrange: 1,
            platform: "OnlinePlatform_Epic",
            firstFrameInGame: 4,
            timeInGame: 296,
            stats: {},
        },
    ],
    teams: [
        {
            color: "blue",
            score: 2,
            playerIds: [
                {id: "blue-1", platform: "OnlinePlatform_Steam"},
                {id: "blue-2", platform: "OnlinePlatform_Steam"},
            ],
            stats: {
                possession: {
                    possessionTime: 120,
                },
            },
        },
        {
            color: "orange",
            score: 1,
            playerIds: [
                {id: "orange-1", platform: "OnlinePlatform_Epic"},
                {id: "orange-2", platform: "OnlinePlatform_Epic"},
            ],
        },
    ],
};

describe("StatsConverterService", () => {
    it("converts summary-only carball payloads without frame-derived stats", () => {
        const service = new StatsConverterService();

        const result = service.convertStats([
            {
                parser: Parser.CARBALL,
                analysisMode: "summary-only",
                parserVersion: 4,
                outputPath: "dev/v4/summary-only.json",
                data: SUMMARY_ONLY_CARBALL_REPLAY,
            } as any,
        ]);

        expect(result.games).toHaveLength(1);
        expect(result.games[0].teams[0].score).toBe(2);
        expect(result.games[0].teams[0].players[0]).toEqual({
            name: "Blue One",
            stats: {goals: 2},
        });
        expect(result.games[0].teams[1].score).toBe(1);
        expect(result.games[0].teams[1].players[0]).toEqual({
            name: "Orange One",
            stats: {goals: 1},
        });
    });

    it("maps camelCase full-analysis carball fields into ballchasing-compatible stats", () => {
        const converter = new CarballConverterService();

        const result = converter.convertToBallchasingFormat(
            FULL_ANALYSIS_CARBALL_REPLAY as any,
            "dev/v4/full-analysis.json",
        );

        expect(result.playlist_id).toBe("private");
        expect(result.playlist_name).toBe("Private");
        expect(result.match_guid).toBe("full-analysis-match-guid");
        expect(result.blue.stats.ball.possession_time).toBe(120);
        expect(result.blue.players[0].id).toEqual({id: "blue-1", platform: "steam"});
        expect(result.blue.players[0].camera.fov).toBe(108);
        expect(result.blue.players[0].stats.core.goals).toBe(2);
        expect(result.blue.players[0].stats.core.shots).toBe(3);
        expect(result.blue.players[0].stats.boost.avg_amount).toBe(42);
        expect(result.blue.players[0].stats.boost.amount_collected).toBe(1200);
        expect(result.blue.players[0].stats.movement.avg_speed).toBe(1500);
        expect(result.blue.players[0].stats.movement.total_distance).toBe(1650);
        expect(result.blue.players[0].stats.positioning.time_behind_ball).toBe(160);
        expect(result.blue.players[0].stats.positioning.time_most_back).toBe(120);
    });
});
