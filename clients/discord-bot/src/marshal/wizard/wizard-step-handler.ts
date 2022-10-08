import type {TextChannel} from "discord.js";
import {Message} from "discord.js";

import type {
    StepOptions,
    ValidWizardCollector,
    WizardFunction,
    WizardFunctionOutput,
} from "./wizard.types";
import {defaultStepOptions, WizardExitStatus} from "./wizard.types";

export const WizardStepHandler =
    (
        collector: ValidWizardCollector,
        initiator: Message,
        // eslint-disable-next-line @typescript-eslint/default-param-last
        opts: StepOptions = defaultStepOptions,
        func: WizardFunction,
        // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
    ): ((...args: any[]) => void | Promise<void>) =>
    async (...iArgs): Promise<void> => {
        let context: TextChannel;

        if (iArgs[0] instanceof Message) {
            const message = iArgs[0];
            if (message.content === "cancel") {
                await message.reply("Canceled.");
                collector.stop(WizardExitStatus.EXIT);
                return;
            }
            // Do message-y stuff here
            context = message.channel as TextChannel;
        } else {
            context = initiator.channel as TextChannel;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        let result: WizardFunctionOutput = await func(...iArgs);
        if (typeof result[0] === "boolean") {
            if (result[0]) result = [WizardExitStatus.SUCCESS, result[1]];
            else result = [WizardExitStatus.FAIL, result[1]];
        }

        switch (result[0]) {
            case WizardExitStatus.FAIL:
                await context.send(
                    `${result[1] ?? ""} Please try again, or enter \`cancel\`.`,
                );
                if (opts.resetTimerOnFail) {
                    collector.resetTimer();
                }
                break;
            case WizardExitStatus.WAIT:
                if (result[1]) await context.send(`${result[1]}`);
                if (opts.resetTimerOnWait) {
                    collector.resetTimer();
                }
                break;
            case WizardExitStatus.SUCCESS:
                if (result[1]) await context.send(`${result[1]}`);
                collector.stop();
                break;
            case WizardExitStatus.EXIT:
                if (result[1]) await context.send(`${result[1]}`);
                collector.stop(result[0]);
                break;
            default:
                collector.stop();
                break;
        }
    };
