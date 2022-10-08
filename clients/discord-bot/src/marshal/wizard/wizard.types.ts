/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    InteractionCollector,
    Message,
    MessageCollector,
    MessageComponentInteraction,
    MessageReaction,
    ReactionCollector,
    User,
} from "discord.js";

export enum WizardType {
    MESSAGE = "MESSAGE",
    REACTION = "REACTION",
    COMPONENT = "COMPONENT",
}

export type WizardFunctionOutput =
    | [boolean, string?]
    | [WizardExitStatus, string?];
export type WizardFunction = (
    ...args: any[]
) => Promise<WizardFunctionOutput> | WizardFunctionOutput;
export type MessageCollectorFilterFunction = (message: Message) => boolean;
export type ReactionCollectorFilterFunction = (
    reaction: MessageReaction,
    user: User,
) => boolean;
export type InteractionCollectorFilterFunction = (
    interaction: MessageComponentInteraction,
) => boolean;
export type CollectorFilterFunction =
    | MessageCollectorFilterFunction
    | ReactionCollectorFilterFunction
    | InteractionCollectorFilterFunction;

export type ValidWizardCollector =
    | MessageCollector
    | ReactionCollector
    | InteractionCollector<MessageComponentInteraction>;

export enum WizardExitStatus {
    SUCCESS = "SUCCESS",
    WAIT = "WAIT",
    FAIL = "FAIL",
    /**
     * Immediately exit the collector, do not call the .finally() function
     */
    EXIT = "EXIT",
}

export interface Step {
    func: WizardFunction;
    opts?: StepOptions;
}

export interface StepOptions {
    filter?: CollectorFilterFunction;
    timeout?: number;
    collectorType?: WizardType;
    collectorTarget?: Message;
    max?: number;
    resetTimerOnFail?: boolean;
    resetTimerOnWait?: boolean;
}

export const defaultStepOptions = {
    resetTimerOnFail: true,
    resetTimerOnWait: false,
};

export type WizardFinalFunction = (
    messages: Map<string, Message>,
) => Promise<any>;
