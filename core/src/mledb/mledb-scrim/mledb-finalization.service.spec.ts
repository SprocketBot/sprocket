import {Parser} from "@sprocketbot/common";

import {MledbFinalizationService} from "./mledb-finalization.service";

describe("MledbFinalizationService", () => {
    const makeService = (): MledbFinalizationService => new MledbFinalizationService(
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
    );

    it("degrades malformed carball payloads instead of throwing during legacy finalization", () => {
        const service = makeService();
        const item = {
            originalFilename: "bad-carball.replay",
            outputPath: "dev/v4/bad-carball.json",
            progress: {
                result: {
                    parser: Parser.CARBALL,
                    data: {
                        game_metadata: "not-an-object",
                        players: "not-an-array",
                        teams: null,
                    },
                },
            },
        } as any;

        const firstReplay = (service as any).normalizeReplayForLegacySave(item, "submission-123", 0);
        const secondReplay = (service as any).normalizeReplayForLegacySave(item, "submission-123", 0);

        expect(firstReplay.match_guid).toBeTruthy();
        expect(firstReplay.match_guid).toEqual(secondReplay.match_guid);
        expect(firstReplay.duration).toBe(0);
        expect(firstReplay.blue.players).toEqual([]);
        expect(firstReplay.orange.players).toEqual([]);
    });
});
