import type {
    CoreService, MatchmakingService, RedisService, ReplaySubmission,
} from "@sprocketbot/common";

import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";

describe("ReplaySubmissionCrudService.getOrCreateSubmission", () => {
    let service: ReplaySubmissionCrudService;
    let redisService: {getJsonIfExists: jest.Mock; setJson: jest.Mock;};

    beforeEach(() => {
        redisService = {getJsonIfExists: jest.fn(), setJson: jest.fn()};
        service = new ReplaySubmissionCrudService(
            redisService as unknown as RedisService,
            {send: jest.fn()} as unknown as MatchmakingService,
            {send: jest.fn()} as unknown as CoreService,
        );
    });

    it("refuses to recreate a submission that already has replays", async () => {
        redisService.getJsonIfExists.mockResolvedValue({id: "scrim-x", items: [ {taskId: "t1"} ] });

        await expect(service.getOrCreateSubmission("scrim-x", 2)).rejects.toThrow(/already has replays/);
        expect(redisService.setJson).not.toHaveBeenCalled();
    });

    it("reuses a submission whose replays were cleared by a rejection", async () => {
        const rejected = {id: "scrim-x", items: [] } as unknown as ReplaySubmission;
        redisService.getJsonIfExists.mockResolvedValue(rejected);

        await expect(service.getOrCreateSubmission("scrim-x", 2)).resolves.toBe(rejected);
        expect(redisService.setJson).not.toHaveBeenCalled();
    });
});
