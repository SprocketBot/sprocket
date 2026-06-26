import {of} from "rxjs";
import {
    ResponseStatus,
    SubmissionEndpoint,
    SubmissionService,
} from "@sprocketbot/common";

function makeService(returnValue: unknown): SubmissionService {
    const mockClient = {
        send: jest.fn().mockReturnValue(of(returnValue)),
    };
    return new SubmissionService(mockClient as any);
}

describe("SubmissionService.send", () => {
    describe("CanSubmitReplays — returns an object", () => {
        it("succeeds and returns the parsed object when canSubmit is true", async () => {
            const service = makeService({canSubmit: true});
            const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
                submissionId: "sub-1",
                memberId: 1,
                userId: 1,
            });
            expect(result.status).toBe(ResponseStatus.SUCCESS);
            if (result.status === ResponseStatus.SUCCESS) {
                expect(result.data).toEqual({canSubmit: true});
            }
        });

        it("succeeds and returns reason when canSubmit is false", async () => {
            const service = makeService({canSubmit: false, reason: "Not a participant"});
            const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
                submissionId: "sub-1",
                memberId: 1,
                userId: 1,
            });
            expect(result.status).toBe(ResponseStatus.SUCCESS);
            if (result.status === ResponseStatus.SUCCESS) {
                expect(result.data).toEqual({canSubmit: false, reason: "Not a participant"});
            }
        });
    });

    describe("SubmitReplays — returns a string array", () => {
        it("succeeds and returns the task id array", async () => {
            const taskIds = ["task-uuid-1", "task-uuid-2"];
            const service = makeService(taskIds);
            const result = await service.send(SubmissionEndpoint.SubmitReplays, {
                submissionId: "sub-1",
                filepaths: [{minioPath: "replays/abc.replay", originalFilename: "game1.replay"}],
                creatorId: 1,
            });
            expect(result.status).toBe(ResponseStatus.SUCCESS);
            if (result.status === ResponseStatus.SUCCESS) {
                expect(result.data).toEqual(taskIds);
            }
        });
    });

    describe("invalid responses — Zod rejects bad shapes", () => {
        it("returns an error when the transport returns an unexpected shape", async () => {
            const service = makeService({unexpected: "shape"});
            const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
                submissionId: "sub-1",
                memberId: 1,
                userId: 1,
            });
            expect(result.status).toBe(ResponseStatus.ERROR);
        });
    });
});
