import {Parser} from "@sprocketbot/common";

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
});
