import {
    ProgressStatus,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
} from "@sprocketbot/common";

import {ReplaySubmissionPostgresRepository} from "./replay-submission-postgres.repository";

describe("ReplaySubmissionPostgresRepository", () => {
    it("hydrates a submission from typed Postgres relations", async () => {
        const query = jest.fn()
            .mockResolvedValueOnce({
                rows: [ {
                    id: "match-1",
                    creator_id: 10,
                    status: ReplaySubmissionStatus.RATIFYING,
                    type: ReplaySubmissionType.MATCH,
                    task_ids: [],
                    validated: true,
                    stats: {games: [] },
                    required_ratifications: 2,
                    match_id: 99,
                    home_franchise_id: 1,
                    away_franchise_id: 2,
                    required_franchises: 2,
                    current_franchise_count: 1,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    task_id: "task-1",
                    original_filename: "one.replay",
                    input_path: "replays/in",
                    output_path: "replays/out",
                    progress: {
                        taskId: "task-1",
                        status: ProgressStatus.Complete,
                        progress: {value: 100, message: "done"},
                        result: {outputPath: "replays/out"},
                        error: null,
                    },
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    player_id: 10,
                    franchise_id: 1,
                    franchise_name: "Home",
                    ratified_at: new Date("2026-01-01T00:00:00.000Z"),
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    id: 5,
                    player_id: 11,
                    reason: "bad file",
                    rejected_at: new Date("2026-01-02T00:00:00.000Z"),
                    stale: false,
                } ],
            })
            .mockResolvedValueOnce({
                rows: [ {
                    rejection_id: 5,
                    task_id: "task-1",
                    original_filename: "one.replay",
                    input_path: "replays/in",
                    output_path: "replays/out",
                } ],
            });
        const repo = new ReplaySubmissionPostgresRepository({query} as any);

        const submission = await repo.findById("match-1");

        expect(submission).toMatchObject({
            id: "match-1",
            type: ReplaySubmissionType.MATCH,
            matchId: 99,
            validated: true,
            franchiseValidation: {
                homeFranchiseId: 1,
                awayFranchiseId: 2,
                requiredFranchises: 2,
                currentFranchiseCount: 1,
            },
            ratifiers: [ {
                playerId: 10,
                franchiseId: 1,
                franchiseName: "Home",
                ratifiedAt: "2026-01-01T00:00:00.000Z",
            } ],
            items: [ {
                taskId: "task-1",
                originalFilename: "one.replay",
                inputPath: "replays/in",
                outputPath: "replays/out",
            } ],
            rejections: [ {
                playerId: 11,
                reason: "bad file",
                rejectedAt: "2026-01-02T00:00:00.000Z",
                stale: false,
                rejectedItems: [ {
                    taskId: "task-1",
                    originalFilename: "one.replay",
                    inputPath: "replays/in",
                    outputPath: "replays/out",
                } ],
            } ],
        });
    });

    it("stores a rejection and its rejected items in one transaction", async () => {
        const client = {
            query: jest.fn()
                .mockResolvedValueOnce({rows: [ {id: 7} ] })
                .mockResolvedValue({rows: [] }),
        };
        const transaction = jest.fn(async cb => cb(client));
        const repo = new ReplaySubmissionPostgresRepository({transaction} as any);

        await repo.addRejection("match-1", {
            playerId: 12,
            reason: "wrong replay",
            rejectedAt: "2026-01-02T00:00:00.000Z",
            stale: false,
            rejectedItems: [ {
                taskId: "task-1",
                originalFilename: "one.replay",
                inputPath: "replays/in",
                outputPath: "replays/out",
            } ],
        });

        expect(transaction).toHaveBeenCalledTimes(1);
        expect(client.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO sprocket.replay_submission_rejection"),
            ["match-1", 12, "wrong replay", "2026-01-02T00:00:00.000Z", false],
        );
        expect(client.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO sprocket.replay_submission_rejection_item"),
            [7, 0, "task-1", "one.replay", "replays/in", "replays/out"],
        );
        expect(client.query).toHaveBeenCalledWith(
            "UPDATE sprocket.replay_submission SET updated_at = now() WHERE id = $1",
            ["match-1"],
        );
    });

    it("upserts replay items without storing a whole submission blob", async () => {
        const client = {
            query: jest.fn()
                .mockResolvedValueOnce({rows: [] })
                .mockResolvedValueOnce({rows: [ {position: 0} ] })
                .mockResolvedValue({rows: [] }),
        };
        const transaction = jest.fn(async cb => cb(client));
        const repo = new ReplaySubmissionPostgresRepository({transaction} as any);

        await repo.upsertItem("match-1", {
            taskId: "task-1",
            originalFilename: "one.replay",
            inputPath: "replays/in",
            progress: {
                taskId: "task-1",
                status: ProgressStatus.Pending,
                progress: {value: 0, message: "queued"},
                result: null,
                error: null,
            } as any,
        });

        expect(client.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO sprocket.replay_submission_item"),
            [
                "match-1",
                "task-1",
                0,
                "one.replay",
                "replays/in",
                null,
                expect.objectContaining({taskId: "task-1", status: ProgressStatus.Pending}),
            ],
        );
    });
});
