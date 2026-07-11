import type {ClientProxy} from "@nestjs/microservices";
import {of} from "rxjs";

import {ResponseStatus} from "../../global.types";
import {SubmissionService} from "./submission.service";
import {SubmissionEndpoint} from "./submission.types";

function createService(response: unknown): SubmissionService {
    const client = {
        send: () => of(response),
    } as unknown as ClientProxy;

    return new SubmissionService(client);
}

function assertSuccess<T>(value: {status: ResponseStatus; data?: T; error?: Error;}): T {
    expect(value.status).toBe(ResponseStatus.SUCCESS);
    return value.data as T;
}

describe("SubmissionService response shapes", () => {
    it("accepts object responses for CanSubmitReplays success", async () => {
        const service = createService({canSubmit: true});
        const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
            submissionId: "scrim-test",
            memberId: 123,
            userId: 456,
        });

        expect(assertSuccess<{canSubmit: boolean;}>(result).canSubmit).toBe(true);
    });

    it("accepts object responses for CanSubmitReplays rejection", async () => {
        const service = createService({canSubmit: false, reason: "not your submission"});
        const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
            submissionId: "scrim-test",
            memberId: 123,
            userId: 456,
        });

        expect(assertSuccess(result)).toEqual({
            canSubmit: false,
            reason: "not your submission",
        });
    });

    it("accepts array responses for SubmitReplays task ids", async () => {
        const service = createService(["task-1", "task-2"]);
        const result = await service.send(SubmissionEndpoint.SubmitReplays, {
            submissionId: "scrim-test",
            creatorId: 456,
            filepaths: [
                {minioPath: "replays/one.replay", originalFilename: "one.replay"},
                {minioPath: "replays/two.replay", originalFilename: "two.replay"},
            ],
        });

        expect(assertSuccess<string[]>(result)).toEqual(["task-1", "task-2"]);
    });
});
