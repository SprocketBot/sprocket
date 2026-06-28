/**
 * Submission connector response-shape smoke tests.
 *
 * Run with: npx ts-node common/src/service-connectors/submission/submission.service.spec.ts
 */

import type {ClientProxy} from "@nestjs/microservices";
import {of} from "rxjs";

import {ResponseStatus} from "../../global.types";
import {SubmissionEndpoint} from "./submission.types";
import {SubmissionService} from "./submission.service";

let passed = 0;
let failed = 0;
const tests: Array<Promise<void>> = [];

function runTest(name: string, fn: () => Promise<void>): void {
    tests.push(fn()
        .then(() => {
            console.log(`PASS ${name}`);
            passed++;
        })
        .catch(error => {
            console.error(`FAIL ${name}`);
            console.error(`  ${error}`);
            failed++;
        }));
}

function createService(response: unknown): SubmissionService {
    const client = {
        send: () => of(response),
    } as unknown as ClientProxy;

    return new SubmissionService(client);
}

function assertSuccess<T>(value: {status: ResponseStatus; data?: T; error?: Error;}): T {
    if (value.status !== ResponseStatus.SUCCESS) {
        throw new Error(`Expected success but got ${value.error?.message}`);
    }
    return value.data as T;
}

console.log("\n=== Submission Connector Response Tests ===\n");

runTest("accepts object responses for CanSubmitReplays success", async () => {
    const service = createService({canSubmit: true});
    const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
        submissionId: "scrim-test",
        memberId: 123,
        userId: 456,
    });

    const data = assertSuccess(result);
    if (data.canSubmit !== true) throw new Error("Expected canSubmit true");
});

runTest("accepts object responses for CanSubmitReplays rejection", async () => {
    const service = createService({canSubmit: false, reason: "not your submission"});
    const result = await service.send(SubmissionEndpoint.CanSubmitReplays, {
        submissionId: "scrim-test",
        memberId: 123,
        userId: 456,
    });

    const data = assertSuccess(result);
    if (data.canSubmit !== false || data.reason !== "not your submission") {
        throw new Error(`Unexpected rejection payload ${JSON.stringify(data)}`);
    }
});

runTest("accepts array responses for SubmitReplays task ids", async () => {
    const service = createService(["task-1", "task-2"]);
    const result = await service.send(SubmissionEndpoint.SubmitReplays, {
        submissionId: "scrim-test",
        creatorId: 456,
        filepaths: [
            {minioPath: "replays/one.replay", originalFilename: "one.replay"},
            {minioPath: "replays/two.replay", originalFilename: "two.replay"},
        ],
    });

    const data = assertSuccess(result);
    if (data.length !== 2 || data[0] !== "task-1" || data[1] !== "task-2") {
        throw new Error(`Unexpected task ids ${JSON.stringify(data)}`);
    }
});

Promise.all(tests).then(() => {
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) process.exit(1);
}).catch(error => {
    console.error(error);
    process.exit(1);
});
