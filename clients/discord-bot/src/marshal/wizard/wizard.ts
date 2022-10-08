import {Logger} from "@nestjs/common";
import type {
    CollectorFilter,
    Message,
    MessageComponentInteraction,
    MessageReaction,
    User,
} from "discord.js";

import type {
    Step,
    StepOptions,
    ValidWizardCollector,
    WizardFinalFunction,
    WizardFunction,
} from "./wizard.types";
import {WizardExitStatus, WizardType} from "./wizard.types";
import {WizardStepHandler} from "./wizard-step-handler";

export class Wizard {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultFilterFunctions: Record<WizardType, (...args: any[]) => boolean> = {
        [WizardType.MESSAGE]: (message: Message): boolean =>
            message.author.id === this.authorId && !message.author.bot,
        [WizardType.REACTION]: (
            reaction: MessageReaction,
            user: User,
        ): boolean => !user.bot,
        [WizardType.COMPONENT]: (
            interaction: MessageComponentInteraction,
        ): boolean => interaction.user.id === this.authorId,
    };

    /**
     * Don't touch this
     * @private
     */
    private _promise: Promise<void> | undefined = undefined;

    private readonly authorId: string;

    private steps: Step[] = [];

    private finalFunction: WizardFinalFunction | undefined;

    private failFunction: WizardFinalFunction | undefined;

    private readonly initiator: Message;

    private readonly logger = new Logger(Wizard.name);

    constructor(initiator: Message) {
        this.authorId = initiator.author.id;
        this.initiator = initiator;
    }

    add(func: WizardFunction, opts?: StepOptions): Wizard {
        const defaultOpts = {
            filter: this.defaultFilterFunctions[
                opts?.collectorType ?? WizardType.MESSAGE
            ],
            timeout: 300000,
            max: 0,
        };

        const step: Step = {func: func, opts: Object.assign(defaultOpts, opts)};
        this.steps = [step, ...this.steps];
        return this;
    }

    finally(func: WizardFinalFunction): Wizard {
        this.finalFunction = func;
        return this;
    }

    onFail(func: WizardFinalFunction): Wizard {
        this.failFunction = func;
        return this;
    }

    async start(): Promise<void> {
        if (this.steps.length) {
            const step = this.steps.pop()!;
            const target = step.opts?.collectorTarget ?? this.initiator;
            this.logger.verbose(
                `Initiating ${step.opts?.collectorType ?? WizardType.MESSAGE}`,
            );
            let collector: ValidWizardCollector;
            switch (step.opts?.collectorType) {
                case WizardType.REACTION: {
                    collector = target.createReactionCollector({
                        filter: step.opts.filter as CollectorFilter<
                            [MessageReaction, User]
                        >,
                        time: step.opts.timeout,
                        idle: step.opts.timeout,
                        max: step.opts.max,
                    });
                    break;
                }
                case WizardType.COMPONENT: {
                    collector = target.createMessageComponentCollector({
                        filter: step.opts.filter as CollectorFilter<
                            [MessageComponentInteraction]
                        >,
                        time: step.opts.timeout,
                        idle: step.opts.timeout,
                        max: step.opts.max,
                    });
                    break;
                }
                case WizardType.MESSAGE:
                default: {
                    collector = target.channel.createMessageCollector({
                        filter: step.opts?.filter as CollectorFilter<[Message]>,
                        time: step.opts?.timeout,
                        idle: step.opts?.timeout,
                        max: step.opts?.max,
                    });
                }
            }

            const handler = WizardStepHandler(
                collector,
                this.initiator,
                step.opts,
                step.func,
            );

            // @ts-expect-error I literally just need this to let me commit
            collector.on("collect", (...args: unknown[]) => {
                try {
                    const result = handler(...args);
                    if (result instanceof Promise) {
                        result.catch(e => {
                            this.logger.warn(
                                `${e.name} - ${e.message} caught asyncronously in Wizard`,
                            );
                            this.reject?.(new Error("This is a new error"));
                        });
                    }
                } catch (_e) {
                    const e = _e as Error;
                    this.logger.warn(
                        `${e.name} - ${e.message} caught syncronously in Wizard`,
                    );
                    this.reject?.(e);
                }
            });
            // @ts-expect-error I literally just need this to let me commit
            collector.on("end", this.next.bind(this));
        }
        return this.promise;
    }

    next(messages: Map<string, Message>, reason: string): void {
        if (
            Array.from(messages.values()).some(
                (m: Message) => m.content === "cancel",
            ) ||
            reason === WizardExitStatus.EXIT ||
            reason === "time"
        ) {
            if (this.failFunction) {
                this.failFunction(messages)
                    .then(() => {
                        if (!this.steps.length) {
                            this.resolve?.();
                        }
                    })
                    .catch(this.reject);
            } else {
                this.resolve?.();
            }
            return;
        }
        if (this.steps.length) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this.start
                .bind(this)()
                .catch(() => {});
        } else if (this.finalFunction) {
            this.finalFunction(messages)
                .then(() => {
                    this.resolve?.();
                })
                .catch(this.reject);
        } else {
            this.resolve?.();
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private get promise(): Promise<void> {
        if (this._promise === undefined) {
            this._promise = new Promise((res, rej) => {
                this.resolve = res;
                this.reject = rej;
            });
        }
        return this._promise;
    }

    private resolve?: () => void;

    private reject?: (e?: Error) => void;
}
