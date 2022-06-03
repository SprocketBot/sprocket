import {Injectable, Logger} from "@nestjs/common";
import type {Channel} from "amqplib";
import {connect} from "amqplib";
import {createClient} from "celery-node";
import {Observable} from "rxjs";

import {config} from "../util/config";
import type {
    ProgressMessage, RunOpts,
    Task, TaskArgs,
    TaskResult,
} from "./types";
import {
    CELERY_TASK_REDIS_RESULT_PREFIX,
    taskNames,
    TaskSchemas,
} from "./types";

@Injectable()
export class CeleryService {
    private readonly logger = new Logger(CeleryService.name);

    private readonly celeryClient = createClient(config.celery.broker, config.celery.backend, config.celery.queue);

    private progressChannel: Channel;

    async onApplicationBootstrap(): Promise<void> {
        if (config.redis.secure) {
            this.celeryClient.conf.CELERY_BACKEND_OPTIONS = {
                tls: {
                    servername: config.redis.host,
                },
            };
        }

        this.logger.log(`Connecting to RabbitMQ @ ${config.celery.broker}`);
        const connection = await connect(config.celery.broker, {heartbeat: 120});

        this.progressChannel = await connection.createChannel();
        this.logger.log("Connected to RabbitMQ");
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

        const t = this.celeryClient.createTask(name);
        const asyncResult = t.applyAsync([], args);
        this.logger.debug(`Running celery task synchronously name=${name} taskId=${asyncResult.taskId}`);

        const r = await asyncResult.get() as TaskResult<T>;
        const result = this.parseResult(task, r);
        this.logger.debug(`Celery task completed synchronously name=${name} taskId=${asyncResult.taskId}`);
        // this.logger.verbose(`Celery task completed synchronously name=${name} taskId=${asyncResult.taskId} result=${JSON.stringify(result)}`);

        return result;
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

        const t = this.celeryClient.createTask(name);
        const asyncResult = t.applyAsync([], {
            ...args,
            progressQueue: opts?.progressQueue,
        });
        const taskId = asyncResult.taskId;

        this.logger.debug(`Running celery task asynchronously name=${name} taskId=${taskId}`);

        if (opts?.cb) {
            asyncResult.get()
                .then((r: unknown) => {
                    const result = this.parseResult(task, r);
                    const p = opts.cb!(taskId, result, null);
                    if (p instanceof Promise) p.catch(err => { this.logger.error(`Celery task callback failed name=${name} taskId=${taskId}`, err) });
                })
                .catch((error: Error) => {
                    const p = opts.cb!(taskId, null, error);
                    if (p instanceof Promise) p.catch(err => { this.logger.error(`Celery task callback failed name=${name} taskId=${taskId}`, err) });
                });
        } else {
            await asyncResult.get() as TaskResult<T>;
            this.logger.debug(`Celery task completed asynchronously name=${name} taskId=${taskId}`);
        }

        return taskId;
    }

    parseResult<T extends Task>(task: T, result: unknown): TaskResult<T> {
        const parseResult = TaskSchemas[task].result.safeParse(result);
        if (parseResult.success) {
            return parseResult.data;
        }
        this.logger.warn(`Task ${task} result failed schema validation, ${parseResult.error}`);
        // TODO have better error handling on results that don't match the schema
        return result as TaskResult<T>;

    }

    /**
     * Subscribes to messages on a given queue.
     * @param queue The name of the queue to subscribe to.
     * @returns An observable that yields messages from the queue.
     */
    subscribe<T extends Task>(queue: string): Observable<ProgressMessage<T>> {
        const observable = new Observable<ProgressMessage<T>>(sub => {
            // Create queue if doesn't exist
            this.progressChannel.assertQueue(queue)
                .then(() => {
                    this.progressChannel.consume(queue, v => {
                        if (!v) return;
                        // TODO: Zod schema enforcement
                        const msg = JSON.parse(v.content.toString()) as ProgressMessage<T>;

                        this.logger.debug(`Progress queue=${queue} message=${JSON.stringify(msg)}`);
                        sub.next(msg);

                        // How to complete subscription/delete queue here, without knowing if other tasks are complete?
                        // if (msg.status === ProgressStatus.Complete) {
                        //     this.progressChannel.deleteQueue(queue)
                        //         .then(() => { sub.complete() })
                        //         .catch(this.logger.error.bind(this.logger));
                        // }
                    }, {noAck: true}).catch(e => {
                        this.progressChannel.deleteQueue(queue)
                            .then(() => { sub.complete() })
                            .catch(this.logger.error.bind(this.logger));
                        this.logger.error(e);
                    });
                })
                .catch(err => {
                    this.logger.error(`Unable to assert queue ${queue}, cannot subscribe. ${err}`);
                });
        });

        return observable;
    }

    buildResultKey(taskId: string): string {
        return `${CELERY_TASK_REDIS_RESULT_PREFIX}-${taskId}`;
    }
}
