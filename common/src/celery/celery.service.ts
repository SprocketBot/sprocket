import {Injectable, Logger} from "@nestjs/common";
import {Observable} from "rxjs";
import {v4 as uuidv4} from "uuid";

import {PostgresService} from "../postgres";
import type {
    ProgressMessage, RunOpts, Task, TaskArgs, TaskResult,
} from "./types";
import {
    CELERY_TASK_REDIS_RESULT_PREFIX, taskNames, TaskSchemas,
} from "./types";

@Injectable()
export class CeleryService {
    private readonly logger = new Logger(CeleryService.name);

    constructor(private readonly postgres: PostgresService) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.ensureSchema();
    }

    /**
   * Starts a task synchronously (waits for execution to finish).
   * @param task The task to execute.
   * @param args Arguments for the specified task.
   * @returns The return value from the task.
   */
    async runSync<T extends Task>(task: T, args: TaskArgs<T>): Promise<TaskResult<T>> {
        const name = taskNames[task];
        if (!name) throw new Error(`Unsupported Celery task ${task}`);

        const taskId = await this.run(task, args);
        this.logger.debug(`Running postgres task synchronously name=${name} taskId=${taskId}`);

        return this.waitForResult(task, taskId);
    }

    /**
   * Starts a task asynchronously, not waiting for execution to finish. Returns the name of the queue
   * where progress messages are published.
   * @param task The task to execute.
   * @param args Arguments for the specified task.
   * @returns The taskId of the created task. Also used as the name of the queue where task progress messages are published.
   */
    async run<T extends Task>(task: T, args: TaskArgs<T>, opts?: RunOpts<T>): Promise<string> {
        const name = taskNames[task];
        if (!name) throw new Error(`Unsupported Celery task ${task}`);

        await this.ensureSchema();
        const taskId = opts?.taskId ?? uuidv4();
        await this.postgres.query(
            `
                INSERT INTO sprocket.platform_task_queue (
                    id,
                    task,
                    args,
                    progress_queue
                )
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            `,
            [
                taskId,
                name,
                {...args, progressQueue: opts?.progressQueue},
                opts?.progressQueue ?? null,
            ],
        );

        this.logger.debug(`Queued postgres task name=${name} taskId=${taskId}`);

        if (opts?.cb) {
            this.waitForResult(task, taskId)
                .then(async result => opts.cb!(taskId, result, null))
                .catch(error => {
                    const p = opts.cb!(taskId, null, error as Error);
                    if (p instanceof Promise) {
                        p.catch(err => {
                            this.logger.error(`Postgres task callback failed name=${name} taskId=${taskId}`, err);
                        });
                    }
                });
        }

        return taskId;
    }

    parseResult<T extends Task>(task: T, result: unknown): TaskResult<T> {
        try {
            return TaskSchemas[task].result.parse(result);
        } catch (error) {
            this.logger.error(`Failed to parse result for task ${task}:`, error);
            throw error;
        }
    }

    /**
   * Subscribes to messages on a given queue.
   * @param queue The name of the queue to subscribe to.
   * @returns An observable that yields messages from the queue.
   */
    subscribe<T extends Task>(task: T, queue: string): Observable<ProgressMessage<T>> {
        return new Observable<ProgressMessage<T>>(sub => {
            let lastSeenId = 0;
            const timer = setInterval(() => {
                this.postgres.query<{id: string; message: ProgressMessage<T>;}>(
                    `
                        SELECT id::text, message
                        FROM sprocket.platform_task_progress
                        WHERE progress_queue = $1 AND id > $2
                        ORDER BY id ASC
                    `,
                    [queue, lastSeenId],
                )
                    .then(result => {
                        for (const row of result.rows) {
                            lastSeenId = Number(row.id);
                            const message = row.message;
                            if (message.result) {
                                message.result = this.parseResult(task, message.result);
                            }
                            const messageWithoutResult = {...message, result: undefined};
                            this.logger.debug(`Progress queue=${queue} message=${JSON.stringify(messageWithoutResult)}`);
                            sub.next(message);
                        }
                    })
                    .catch(sub.error.bind(sub));
            }, 250);
            timer.unref();
            return (): void => { clearInterval(timer) };
        });
    }

    buildResultKey(taskId: string): string {
        return `${CELERY_TASK_REDIS_RESULT_PREFIX}-${taskId}`;
    }

    private async waitForResult<T extends Task>(task: T, taskId: string): Promise<TaskResult<T>> {
        let attempt = 0;
        while (attempt < Number.MAX_SAFE_INTEGER) {
            attempt += 1;
            const result = await this.postgres.query<{
                status: string;
                result: unknown;
                error: {message?: string;} | null;
            }>(
                "SELECT status, result, error FROM sprocket.platform_task_queue WHERE id = $1",
                [taskId],
            );
            const row = result.rows.at(0);
            if (row === undefined) throw new Error(`Task ${taskId} not found`);
            if (row.status === "completed") return this.parseResult(task, row.result);
            if (row.status === "failed") throw new Error(row.error?.message ?? `Task ${taskId} failed`);
            await new Promise<void>(resolve => {
                setTimeout(resolve, 500);
            });
        }
        throw new Error(`Task ${taskId} did not complete`);
    }

    private async ensureSchema(): Promise<void> {
        await this.postgres.query("CREATE SCHEMA IF NOT EXISTS sprocket");
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_task_queue (
                id text NOT NULL,
                task text NOT NULL,
                args jsonb NOT NULL,
                progress_queue text,
                status text NOT NULL DEFAULT 'pending',
                result jsonb,
                error jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                locked_at TIMESTAMPTZ,
                CONSTRAINT "PK_platform_task_queue" PRIMARY KEY (id)
            )
        `);
        await this.postgres.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_task_queue_pending"
            ON sprocket.platform_task_queue (status, created_at)
        `);
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_task_progress (
                id BIGSERIAL NOT NULL,
                task_id text NOT NULL,
                progress_queue text NOT NULL,
                message jsonb NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_task_progress" PRIMARY KEY (id)
            )
        `);
        await this.postgres.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_task_progress_queue"
            ON sprocket.platform_task_progress (progress_queue, id)
        `);
    }
}
