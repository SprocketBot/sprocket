import {Logger} from "@nestjs/common";
import type {
    CeleryService, EventsService, ReplaySubmission, ReplaySubmissionItem,
} from "@sprocketbot/common";

import type {ReplayValidationService} from "../replay-validation/replay-validation.service";
import type {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionService} from "./replay-submission.service";
import type {ReplaySubmissionCrudService} from "./replay-submission-crud/replay-submission-crud.service";
import type {ReplaySubmissionRatificationService} from "./replay-submission-ratification";
import type {StatsConverterService} from "./stats-converter/stats-converter.service";

// The service imports its collaborators as values so Nest can read DI metadata,
// which drags their whole module graph into the test. Stubbing the modules keeps
// this a unit test of beginSubmission and nothing else.
jest.mock("./replay-submission-crud/replay-submission-crud.service", () => ({ReplaySubmissionCrudService: class {}}));
jest.mock("../replay-validation/replay-validation.service", () => ({ReplayValidationService: class {}}));
jest.mock("./parse-subscriber/replay-parse.subscriber", () => ({ReplayParseSubscriber: class {}}));
jest.mock("./replay-submission-ratification", () => ({ReplaySubmissionRatificationService: class {}}));

/**
 * core checks CanSubmitReplays, uploads every replay to MinIO, and only then calls
 * SubmitReplays. Two players submitting inside that window both pass the check, and
 * the second beginSubmission used to recreate the submission over the first one's
 * items, orphaning its parse tasks.
 */

const SUBMISSION_ID = "scrim-concurrent";

const replays = (player: string): Array<{minioPath: string; originalFilename: string;}> => ["1", "2", "3"].map(n => ({
    minioPath: `replays/${player}-${n}.replay`,
    originalFilename: `${player}-${n}.replay`,
}));

// Yield to the event loop so concurrent callers interleave the way they do over Redis.
const tick = async (): Promise<void> => new Promise(resolve => {
    setImmediate(resolve);
});

describe("ReplaySubmissionService concurrent submissions", () => {
    let service: ReplaySubmissionService;
    let submission: ReplaySubmission | undefined;
    let claims: Map<string, string>;
    let failNextCreate: boolean;

    beforeEach(() => {
        Logger.overrideLogger(false);
        submission = undefined;
        claims = new Map();
        failNextCreate = false;

        // In-memory stand-in for the Redis-backed crud service. Every call yields first,
        // so two submitters interleave instead of running one after the other.
        const crud = {
            claimSubmission: jest.fn(async (id: string) => {
                await tick();
                if (claims.has(id)) return null;
                const token = `claim-${claims.size + 1}`;
                claims.set(id, token);
                return token;
            }),
            releaseSubmissionClaim: jest.fn(async (id: string, token: string) => {
                await tick();
                if (claims.get(id) === token) claims.delete(id);
            }),
            // Recreates unconditionally, as the old code did, so only the claim can stop the race.
            getOrCreateSubmission: jest.fn(async (id: string) => {
                await tick();
                if (failNextCreate) {
                    failNextCreate = false;
                    throw new Error("Unable to create submission, could not find a scrim");
                }
                submission = {id: id, items: [] as ReplaySubmissionItem[]} as unknown as ReplaySubmission;
                return submission;
            }),
            updateStatus: jest.fn(async () => tick()),
            upsertItem: jest.fn(async (_id: string, item: ReplaySubmissionItem) => {
                await tick();
                submission!.items.push(item);
            }),
        };

        service = new ReplaySubmissionService(
            crud as unknown as ReplaySubmissionCrudService,
            {run: jest.fn()} as unknown as CeleryService,
            {publish: jest.fn()} as unknown as EventsService,
            {subscribe: jest.fn()} as unknown as ReplayParseSubscriber,
            {} as unknown as ReplayValidationService,
            {} as unknown as ReplaySubmissionRatificationService,
            {} as unknown as StatsConverterService,
        );
    });

    it("lets exactly one of two simultaneous submitters through", async () => {
        const results = await Promise.allSettled([
            service.beginSubmission(replays("alice"), SUBMISSION_ID, 1),
            service.beginSubmission(replays("bob"), SUBMISSION_ID, 2),
        ]);

        const fulfilled = results.filter(r => r.status === "fulfilled");
        const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
        expect(fulfilled).toHaveLength(1);
        expect(rejected).toHaveLength(1);
        expect((rejected[0].reason as Error).message).toMatch(/already submitting/);
        // Only the winner's three replays made it onto the submission.
        expect(submission!.items.map(i => i.taskId).sort()).toEqual([...fulfilled[0].value].sort());
    });

    it("releases the claim when starting the submission fails, so a retry can go through", async () => {
        failNextCreate = true;
        await expect(service.beginSubmission(replays("alice"), SUBMISSION_ID, 1)).rejects.toThrow(/could not find a scrim/);

        await expect(service.beginSubmission(replays("alice"), SUBMISSION_ID, 1)).resolves.toHaveLength(3);
    });
});
