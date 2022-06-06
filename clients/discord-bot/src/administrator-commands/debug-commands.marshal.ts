import {Logger} from "@nestjs/common";
import type {MessageComponentInteraction} from "discord.js";
import {
    Message, MessageActionRow, MessageButton, MessageEmbed,
} from "discord.js";

import {Command, Marshal} from "../marshal";
import {CommandError} from "../marshal/command-error";
import type {
    StepOptions, WizardFunction, WizardFunctionOutput,
} from "../marshal/wizard";
import {
    Wizard, WizardExitStatus, WizardType,
} from "../marshal/wizard";

export class DebugCommandsMarshal extends Marshal {
    private readonly logger = new Logger(DebugCommandsMarshal.name);

    @Command({
        name: "wizardDebug",
        docs: "Tests the Wizard",
        args: [],
    })
    async wizardDebug(m: Message): Promise<void> {
        /*
         * /
         * / SETUP
         * /
         */
        const wizard = new Wizard(m);

        const embed = new MessageEmbed()
            .setColor("#f5c04e")
            .setThumbnail("https://avatars.githubusercontent.com/u/82424226?s=200&v=4")
            .setTitle("Wizard Debugger");

        const response = await m.reply({
            embeds: [embed],
        });

        /*
         * /
         * / DEBUG FUNCTIONS
         * /
         */
        interface DebugFuncDef {
            customId: string;
            button: MessageButton;
            func: WizardFunction;
            options: StepOptions;
            instructions: string;
        }

        const debugFunctions: DebugFuncDef[] = [
            {
                customId: "throw error on react",
                button: new MessageButton()
                    .setStyle("DANGER")
                    .setLabel("Throw Error on React")
                    .setCustomId("throw error on react"),
                options: {
                    collectorType: WizardType.REACTION,
                    collectorTarget: response,
                },
                instructions: "React to the Wizard Debugger to throw an error within the Wizard Step.",
                func: async (): Promise<WizardFunctionOutput> => {
                    throw new CommandError("InternalError", "This is the test exception");
                },
            },
            {
                customId: "throw error on message",
                button: new MessageButton()
                    .setStyle("DANGER")
                    .setLabel("Throw Error on Message")
                    .setCustomId("throw error on message"),
                options: {
                },
                instructions: "Send a message to throw an error within the Wizard Step.",
                func: (r: Message): WizardFunctionOutput => {
                    throw new Error(r.toString());
                },
            },
        ];

        const baseInteractionHandler = async (interaction: MessageComponentInteraction): Promise<WizardFunctionOutput> => {
            await response.reactions.removeAll();
            // Acknowledge it
            const opts = debugFunctions.find(df => df.customId === interaction.customId);
            if (opts) {
                // Handle it
                wizard.add(
                    opts.func,
                    opts.options,
                );
                // Return to sender
                wizard.add(baseInteractionHandler, {
                    collectorType: WizardType.COMPONENT,
                    collectorTarget: response,
                });
                await interaction.reply(opts.instructions);
                return [WizardExitStatus.SUCCESS];
            }
            // Something is wrong.
            throw new CommandError("InternalError", "Unknown customId somehow found in the wizard debug tool");
        };

        /*
         * /
         * / BOOTSTRAPPING
         * /
         */

        wizard.add(baseInteractionHandler, {
            collectorType: WizardType.COMPONENT,
            collectorTarget: response,
        });

        const actionRow = new MessageActionRow();
        actionRow.addComponents(Object.values(debugFunctions).map(df => df.button));

        await response.edit({
            components: [actionRow],
        });

        await wizard.start();
    }
}

