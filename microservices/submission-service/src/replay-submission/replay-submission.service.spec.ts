import {Logger} from "@nestjs/common";
import type {
    CeleryService, EventsService, ReplaySubmissionItem,
} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";

import type {ReplayValidationService} from "../replay-validation/replay-validation.service";
import type {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionService} from "./replay-submission.service";
import type {ReplaySubmissionCrudService} from "./replay-submission-crud/replay-submission-crud.service";
import type {ReplaySubmissionRatificationService} from "./replay-submission-ratification";
import type {StatsConverterService} from "./stats-converter/stats-converter.service";

// The service imports its collaborators as values so Nest can read DI metadata,
// which drags their whole module graph into the test. Stubbing the modules keeps
// this a unit test of the completion gate and nothing else.
jest.mock("./replay-submission-crud/replay-submission-crud.service", () => ({ReplaySubmissionCrudService: class {}}));
jest.mock("../replay-validation/replay-validation.service", () => ({ReplayValidationService: class {}}));
jest.mock("./parse-subscriber/replay-parse.subscriber", () => ({ReplayParseSubscriber: class {}}));
jest.mock("./replay-submission-ratification", () => ({ReplaySubmissionRatificationService: class {}}));

/**
 * A parsed replay reaches this service over two transports with different
 * guarantees:
 *
 *   RabbitMQ progress queue -> item.progress.status, published BEFORE the parse
 *                              output is uploaded
 *   Celery result via Redis -> item.outputPath, only once the upload finished
 *
 * See microservices/replay-parse-service/src/main.py - ParseReplay.run
 *
 * validate() reads outputPath. Gating completion on progress.status therefore let
 * validation run against items whose output did not exist yet, which rejected the
 * submission with no reason recorded and emptied its items. These tests pin the
 * gate to outputPath, the signal that actually tracks readable output.
 */

const FILE_PATHS = [
    {minioPath: "a.replay", originalFilename: "a.replay"},
    {minioPath: "b.replay", originalFilename: "b.replay"},
    {minioPath: "c.replay", originalFilename: "c.replay"},
];

type ParseCallback = (taskId: string, result: unknown, error: Error | null) => Promise<void>;

const clone = (item: ReplaySubmissionItem): ReplaySubmissionItem => JSON.parse(JSON.stringify(item)) as ReplaySubmissionItem;

const parseResult = (name: string): unknown => ({outputPath: `dev/v4/${name}.json`});

describe("ReplaySubmissionService completion gate", () => {
    let service: ReplaySubmissionService;
    let items: Map<string, ReplaySubmissionItem>;
    let callbacks: ParseCallback[];
    let taskIds: string[];
    let validate: jest.Mock;
    let rejectSubmission: jest.Mock;
    let validatedItems: ReplaySubmissionItem[];

    beforeEach(() => {
        Logger.overrideLogger(false);
        items = new Map<string, ReplaySubmissionItem>();
        callbacks = [];
        taskIds = [];
        validatedItems = [];

        validate = jest.fn(async (submission: {items: ReplaySubmissionItem[];}) => {
            validatedItems = submission.items;
            return Promise.resolve({valid: true, errors: [] });
        });
        rejectSubmission = jest.fn();

        const crud = {
            // Always grants the per-submission claim; concurrency is covered in its own spec.
            claimSubmission: jest.fn(async () => "claim"),
            releaseSubmissionClaim: jest.fn(),
            getOrCreateSubmission: jest.fn(),
            updateStatus: jest.fn(),
            expireRejections: jest.fn(),
            setValidatedTrue: jest.fn(),
            setStats: jest.fn(),
            upsertItem: jest.fn(async (_id: string, item: ReplaySubmissionItem) => {
                items.set(item.taskId, clone(item));
            }),
            getSubmissionItems: jest.fn(async () => [...items.values()].map(clone)),
            getSubmission: jest.fn(async (id: string) => ({
                id: id,
                items: [...items.values()].map(clone),
                rejections: [],
            })),
        };

        const celery = {
            run: jest.fn(async (_task: unknown, _args: unknown, opts: {taskId: string; cb: ParseCallback;}) => {
                taskIds.push(opts.taskId);
                callbacks.push(opts.cb);
                return opts.taskId;
            }),
        };

        service = new ReplaySubmissionService(
            crud as unknown as ReplaySubmissionCrudService,
            celery as unknown as CeleryService,
            {publish: jest.fn()} as unknown as EventsService,
            {subscribe: jest.fn()} as unknown as ReplayParseSubscriber,
            {validate: validate} as unknown as ReplayValidationService,
            {rejectSubmission: rejectSubmission} as unknown as ReplaySubmissionRatificationService,
            {convertStats: jest.fn()} as unknown as StatsConverterService,
        );
    });

    /** What the progress queue does: sets status, never sets outputPath. */
    const progressQueueReportsAllComplete = (): void => {
        for (const [taskId, item] of items) {
            items.set(taskId, {
                ...item,
                progress: {...item.progress!, status: ProgressStatus.Complete},
            });
        }
    };

    it("does not validate while any item is still missing its outputPath", async () => {
        await service.beginSubmission(FILE_PATHS, "scrim-race", 1);

        // The progress queue reports every parse Complete. This is the state the
        // old gate accepted, ~7.5s before any output path existed in production.
        progressQueueReportsAllComplete();

        // Only the first Celery result has come back, so only one outputPath exists.
        await callbacks[0](taskIds[0], parseResult("a"), null);

        expect(validate).not.toHaveBeenCalled();
        expect(rejectSubmission).not.toHaveBeenCalled();
    });

    it("validates once, and only once every item has an outputPath", async () => {
        await service.beginSubmission(FILE_PATHS, "scrim-ok", 1);
        progressQueueReportsAllComplete();

        await callbacks[0](taskIds[0], parseResult("a"), null);
        await callbacks[1](taskIds[1], parseResult("b"), null);
        expect(validate).not.toHaveBeenCalled();

        await callbacks[2](taskIds[2], parseResult("c"), null);

        expect(validate).toHaveBeenCalledTimes(1);
        expect(validatedItems).toHaveLength(3);
        expect(validatedItems.every(i => Boolean(i.outputPath))).toBe(true);
    });

    it("does not let a failed parse block completion", async () => {
        await service.beginSubmission(FILE_PATHS, "scrim-error", 1);

        // An item that errored has no outputPath and never will; it must not hold
        // the submission open forever.
        await callbacks[0](taskIds[0], null, new Error("parse failed"));
        await callbacks[1](taskIds[1], parseResult("b"), null);
        await callbacks[2](taskIds[2], parseResult("c"), null);

        expect(validate).toHaveBeenCalledTimes(1);
    });
});
