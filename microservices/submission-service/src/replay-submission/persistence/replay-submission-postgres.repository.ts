import {Injectable, Logger} from "@nestjs/common";
import type {
    EnhancedReplaySubmission,
    FranchiseValidationContext,
    ProgressMessage,
    RatifierInfo,
    ReplaySubmission,
    ReplaySubmissionItem,
    ReplaySubmissionRejection,
    ReplaySubmissionStats,
    Task,
} from "@sprocketbot/common";
import {PostgresService, ReplaySubmissionType} from "@sprocketbot/common";
import type {QueryResult, QueryResultRow} from "pg";

interface DbClient {
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
}
type CompatibleSubmission = ReplaySubmission | EnhancedReplaySubmission;

interface SubmissionRow {
    id: string;
    creator_id: number;
    status: ReplaySubmission["status"];
    type: ReplaySubmissionType;
    task_ids: string[];
    validated: boolean;
    stats?: ReplaySubmissionStats;
    required_ratifications: number;
    scrim_id?: string;
    match_id?: number;
    home_franchise_id?: number;
    away_franchise_id?: number;
    required_franchises?: number;
    current_franchise_count?: number;
}

interface ItemRow {
    task_id: string;
    original_filename: string;
    input_path: string;
    output_path?: string;
    progress?: ProgressMessage<Task.ParseReplay>;
}

interface RatifierRow {
    player_id: number;
    franchise_id?: number;
    franchise_name?: string;
    ratified_at?: Date;
}

interface RejectionRow {
    id: number;
    player_id: number;
    reason: string;
    rejected_at: Date;
    stale: boolean;
}

interface RejectionItemRow {
    rejection_id: number;
    task_id: string;
    original_filename: string;
    input_path: string;
    output_path?: string;
}

@Injectable()
export class ReplaySubmissionPostgresRepository {
    private readonly logger = new Logger(ReplaySubmissionPostgresRepository.name);

    constructor(private readonly postgres: PostgresService) {}

    async findAll(): Promise<CompatibleSubmission[]> {
        try {
            const result = await this.postgres.query<SubmissionRow>("SELECT * FROM sprocket.replay_submission ORDER BY created_at ASC");
            this.logger.debug(`findAll: rows length = ${result.rows.length}`);
            const hydrated = await Promise.all(result.rows.map(async row => this.hydrate(row)));
            this.logger.debug(`findAll: hydrated length = ${hydrated.length}`);
            return hydrated;
        } catch (error) {
            this.logger.error("findAll error", error);
            throw error;
        }
    }

    async findById(submissionId: string): Promise<CompatibleSubmission | undefined> {
        const result = await this.postgres.query<SubmissionRow>(
            "SELECT * FROM sprocket.replay_submission WHERE id = $1",
            [submissionId],
        );
        if (!result.rows[0]) return undefined;
        return this.hydrate(result.rows[0]);
    }

    async saveSubmission(submission: CompatibleSubmission): Promise<void> {
        await this.postgres.query(
            `
                INSERT INTO sprocket.replay_submission (
                    id,
                    creator_id,
                    status,
                    type,
                    task_ids,
                    validated,
                    stats,
                    required_ratifications,
                    scrim_id,
                    match_id,
                    home_franchise_id,
                    away_franchise_id,
                    required_franchises,
                    current_franchise_count
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT (id) DO UPDATE SET
                    updated_at = now(),
                    creator_id = EXCLUDED.creator_id,
                    status = EXCLUDED.status,
                    type = EXCLUDED.type,
                    task_ids = EXCLUDED.task_ids,
                    validated = EXCLUDED.validated,
                    stats = EXCLUDED.stats,
                    required_ratifications = EXCLUDED.required_ratifications,
                    scrim_id = EXCLUDED.scrim_id,
                    match_id = EXCLUDED.match_id,
                    home_franchise_id = EXCLUDED.home_franchise_id,
                    away_franchise_id = EXCLUDED.away_franchise_id,
                    required_franchises = EXCLUDED.required_franchises,
                    current_franchise_count = EXCLUDED.current_franchise_count
            `,
            [
                submission.id,
                submission.creatorId,
                submission.status,
                submission.type,
                submission.taskIds,
                submission.validated,
                submission.stats ?? null,
                submission.requiredRatifications,
                "scrimId" in submission ? submission.scrimId : null,
                "matchId" in submission ? submission.matchId : null,
                this.getFranchiseValidation(submission)?.homeFranchiseId ?? null,
                this.getFranchiseValidation(submission)?.awayFranchiseId ?? null,
                this.getFranchiseValidation(submission)?.requiredFranchises ?? null,
                this.getFranchiseValidation(submission)?.currentFranchiseCount ?? null,
            ],
        );
    }

    async delete(submissionId: string): Promise<void> {
        await this.postgres.query(
            "DELETE FROM sprocket.replay_submission WHERE id = $1",
            [submissionId],
        );
    }

    async replaceItems(submissionId: string, items: ReplaySubmissionItem[]): Promise<void> {
        await this.postgres.transaction(async client => {
            await client.query("DELETE FROM sprocket.replay_submission_item WHERE submission_id = $1", [submissionId]);
            await Promise.all(items.map(async (item, index) => this.upsertItemWithClient(client, submissionId, item, index)));
            await this.touch(client, submissionId);
        });
    }

    async getItems(submissionId: string): Promise<ReplaySubmissionItem[]> {
        return this.loadItems(this.postgres, submissionId);
    }

    async upsertItem(submissionId: string, item: ReplaySubmissionItem): Promise<void> {
        await this.postgres.transaction(async client => {
            const position = await this.getItemPosition(client, submissionId, item.taskId);
            await this.upsertItemWithClient(client, submissionId, item, position);
            await this.touch(client, submissionId);
        });
    }

    async updateStatus(submissionId: string, status: ReplaySubmission["status"]): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.replay_submission SET status = $2, updated_at = now() WHERE id = $1",
            [submissionId, status],
        );
    }

    async setValidated(submissionId: string, validated: boolean): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.replay_submission SET validated = $2, updated_at = now() WHERE id = $1",
            [submissionId, validated],
        );
    }

    async setStats(submissionId: string, stats: ReplaySubmissionStats): Promise<void> {
        await this.postgres.query(
            "UPDATE sprocket.replay_submission SET stats = $2, updated_at = now() WHERE id = $1",
            [submissionId, stats],
        );
    }

    async getRatifiers(submissionId: string): Promise<number[] | RatifierInfo[]> {
        const rows = await this.loadRatifiers(this.postgres, submissionId);
        return this.mapRatifiers(rows);
    }

    async clearRatifiers(submissionId: string): Promise<void> {
        await this.postgres.transaction(async client => {
            await client.query("DELETE FROM sprocket.replay_submission_ratifier WHERE submission_id = $1", [submissionId]);
            await client.query(
                "UPDATE sprocket.replay_submission SET current_franchise_count = 0, updated_at = now() WHERE id = $1",
                [submissionId],
            );
        });
    }

    async addNumericRatifier(submissionId: string, playerId: number): Promise<void> {
        await this.postgres.transaction(async client => {
            await client.query(
                `
                    INSERT INTO sprocket.replay_submission_ratifier (submission_id, player_id)
                    VALUES ($1, $2)
                    ON CONFLICT (submission_id, player_id) DO NOTHING
                `,
                [submissionId, playerId],
            );
            await this.touch(client, submissionId);
        });
    }

    async addEnhancedRatifier(submissionId: string, ratifier: RatifierInfo): Promise<number> {
        return this.postgres.transaction(async client => {
            await client.query(
                `
                    INSERT INTO sprocket.replay_submission_ratifier (
                        submission_id,
                        player_id,
                        franchise_id,
                        franchise_name,
                        ratified_at
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (submission_id, player_id) DO NOTHING
                `,
                [
                    submissionId,
                    ratifier.playerId,
                    ratifier.franchiseId,
                    ratifier.franchiseName,
                    ratifier.ratifiedAt,
                ],
            );
            const countResult = await client.query<{count: string;}>(
                `
                    SELECT COUNT(DISTINCT franchise_id)::text AS count
                    FROM sprocket.replay_submission_ratifier
                    WHERE submission_id = $1 AND franchise_id IS NOT NULL
                `,
                [submissionId],
            );
            const uniqueFranchiseCount = Number(countResult.rows[0]?.count ?? 0);
            await client.query(
                `
                    UPDATE sprocket.replay_submission
                    SET current_franchise_count = $2, updated_at = now()
                    WHERE id = $1
                `,
                [submissionId, uniqueFranchiseCount],
            );
            return uniqueFranchiseCount;
        });
    }

    async getRejections(submissionId: string): Promise<ReplaySubmissionRejection[]> {
        return this.loadRejections(this.postgres, submissionId);
    }

    async expireRejections(submissionId: string): Promise<void> {
        await this.postgres.query(
            `
                UPDATE sprocket.replay_submission_rejection
                SET stale = true
                WHERE submission_id = $1
            `,
            [submissionId],
        );
    }

    async addRejection(submissionId: string, rejection: ReplaySubmissionRejection): Promise<void> {
        await this.postgres.transaction(async client => {
            const result = await client.query<{id: number;}>(
                `
                    INSERT INTO sprocket.replay_submission_rejection (
                        submission_id,
                        player_id,
                        reason,
                        rejected_at,
                        stale
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `,
                [
                    submissionId,
                    rejection.playerId,
                    rejection.reason,
                    rejection.rejectedAt,
                    rejection.stale,
                ],
            );
            const rejectionId = result.rows[0].id;
            await Promise.all(rejection.rejectedItems.map(async (item, index) => client.query(
                `
                    INSERT INTO sprocket.replay_submission_rejection_item (
                        rejection_id,
                        position,
                        task_id,
                        original_filename,
                        input_path,
                        output_path
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    rejectionId,
                    index,
                    item.taskId,
                    item.originalFilename,
                    item.inputPath,
                    item.outputPath ?? null,
                ],
            )));
            await this.touch(client, submissionId);
        });
    }

    private async hydrate(row: SubmissionRow): Promise<CompatibleSubmission> {
        const [items, ratifierRows, rejections] = await Promise.all([
            this.loadItems(this.postgres, row.id),
            this.loadRatifiers(this.postgres, row.id),
            this.loadRejections(this.postgres, row.id),
        ]);
        const base = {
            id: row.id,
            creatorId: row.creator_id,
            status: row.status,
            taskIds: row.task_ids,
            items: items,
            validated: row.validated,
            stats: row.stats,
            ratifiers: this.mapRatifiers(ratifierRows),
            requiredRatifications: row.required_ratifications,
            rejections: rejections,
        };
        const franchiseValidation = this.mapFranchiseValidation(row);
        const typedBase = franchiseValidation ? {...base, franchiseValidation} : base;

        if (row.type === ReplaySubmissionType.MATCH) {
            return {
                ...typedBase,
                type: ReplaySubmissionType.MATCH,
                matchId: row.match_id!,
            } as CompatibleSubmission;
        }

        return {
            ...typedBase,
            type: row.type,
            scrimId: row.scrim_id!,
        } as CompatibleSubmission;
    }

    private async loadItems(client: DbClient, submissionId: string): Promise<ReplaySubmissionItem[]> {
        const result = await client.query<ItemRow>(
            `
                SELECT task_id, original_filename, input_path, output_path, progress
                FROM sprocket.replay_submission_item
                WHERE submission_id = $1
                ORDER BY position ASC
            `,
            [submissionId],
        );
        return result.rows.map(row => ({
            taskId: row.task_id,
            originalFilename: row.original_filename,
            inputPath: row.input_path,
            outputPath: row.output_path ?? undefined,
            progress: row.progress ?? undefined,
        }));
    }

    private async loadRatifiers(client: DbClient, submissionId: string): Promise<RatifierRow[]> {
        const result = await client.query<RatifierRow>(
            `
                SELECT player_id, franchise_id, franchise_name, ratified_at
                FROM sprocket.replay_submission_ratifier
                WHERE submission_id = $1
                ORDER BY id ASC
            `,
            [submissionId],
        );
        return result.rows;
    }

    private async loadRejections(client: DbClient, submissionId: string): Promise<ReplaySubmissionRejection[]> {
        const rejectionResult = await client.query<RejectionRow>(
            `
                SELECT id, player_id, reason, rejected_at, stale
                FROM sprocket.replay_submission_rejection
                WHERE submission_id = $1
                ORDER BY id ASC
            `,
            [submissionId],
        );
        if (!rejectionResult.rows.length) return [];

        const itemResult = await client.query<RejectionItemRow>(
            `
                SELECT rejection_id, task_id, original_filename, input_path, output_path
                FROM sprocket.replay_submission_rejection_item
                WHERE rejection_id = ANY($1::int[])
                ORDER BY rejection_id ASC, position ASC
            `,
            [rejectionResult.rows.map(row => row.id)],
        );

        return rejectionResult.rows.map(row => ({
            playerId: row.player_id,
            reason: row.reason,
            rejectedAt: row.rejected_at.toISOString(),
            stale: row.stale,
            rejectedItems: itemResult.rows
                .filter(item => item.rejection_id === row.id)
                .map(item => ({
                    taskId: item.task_id,
                    originalFilename: item.original_filename,
                    inputPath: item.input_path,
                    outputPath: item.output_path ?? undefined,
                })),
        }));
    }

    private mapRatifiers(rows: RatifierRow[]): number[] | RatifierInfo[] {
        if (!rows.some(row => row.franchise_id !== undefined)) {
            return rows.map(row => row.player_id);
        }
        return rows.map(row => ({
            playerId: row.player_id,
            franchiseId: row.franchise_id!,
            franchiseName: row.franchise_name!,
            ratifiedAt: row.ratified_at?.toISOString() ?? new Date().toISOString(),
        }));
    }

    private async getItemPosition(client: DbClient, submissionId: string, taskId: string): Promise<number> {
        const result = await client.query<{position: number;}>(
            `
                SELECT position
                FROM sprocket.replay_submission_item
                WHERE submission_id = $1 AND task_id = $2
            `,
            [submissionId, taskId],
        );
        if (result.rows[0]) return result.rows[0].position;

        const maxResult = await client.query<{position: number;}>(
            `
                SELECT COALESCE(MAX(position) + 1, 0) AS position
                FROM sprocket.replay_submission_item
                WHERE submission_id = $1
            `,
            [submissionId],
        );
        return maxResult.rows[0].position;
    }

    private async upsertItemWithClient(
        client: DbClient,
        submissionId: string,
        item: ReplaySubmissionItem,
        position: number,
    ): Promise<void> {
        await client.query(
            `
                INSERT INTO sprocket.replay_submission_item (
                    submission_id,
                    task_id,
                    position,
                    original_filename,
                    input_path,
                    output_path,
                    progress
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (submission_id, task_id) DO UPDATE SET
                    original_filename = EXCLUDED.original_filename,
                    input_path = EXCLUDED.input_path,
                    output_path = EXCLUDED.output_path,
                    progress = EXCLUDED.progress
            `,
            [
                submissionId,
                item.taskId,
                position,
                item.originalFilename,
                item.inputPath,
                item.outputPath ?? null,
                item.progress ?? null,
            ],
        );
    }

    private async touch(client: DbClient, submissionId: string): Promise<void> {
        await client.query(
            "UPDATE sprocket.replay_submission SET updated_at = now() WHERE id = $1",
            [submissionId],
        );
    }

    private getFranchiseValidation(submission: CompatibleSubmission): FranchiseValidationContext | undefined {
        return "franchiseValidation" in submission ? submission.franchiseValidation : undefined;
    }

    private mapFranchiseValidation(row: SubmissionRow): FranchiseValidationContext | undefined {
        if (row.required_franchises === undefined) return undefined;
        return {
            homeFranchiseId: row.home_franchise_id ?? undefined,
            awayFranchiseId: row.away_franchise_id ?? undefined,
            requiredFranchises: row.required_franchises,
            currentFranchiseCount: row.current_franchise_count ?? 0,
        };
    }
}
