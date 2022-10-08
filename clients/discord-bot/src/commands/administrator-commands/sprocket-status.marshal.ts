import {Logger} from "@nestjs/common";
import type {MessageComponentInteraction, TextChannel} from "discord.js";
import {Message} from "discord.js";

import {Command, Marshal} from "../../marshal";
import type {WizardFunctionOutput} from "../../marshal/wizard";
import {
    Wizard, WizardExitStatus, WizardType,
} from "../../marshal/wizard";

export class SprocketStatusMarshal extends Marshal {
    private readonly logger = new Logger(SprocketStatusMarshal.name);

    @Command({
        name: "status",
        docs: "Sends a status update to the community",
        args: [],
    })
    async status(m: Message): Promise<void> {
        const statusChannel = await m.client.channels.fetch("866420216653414400") as TextChannel;
        const wizard = new Wizard(m);

        const messagesToDelete: Message[] = [m];

        const messageEmbed = {
            title: "\u200B",
            description: "\u200B",
            color: 0xF5C04E,
            timestamp: new Date(),
            thumbnail: {
                url: "https://avatars.githubusercontent.com/u/82424226?s=200&v=4",
            },
            footer: {
                text: "Sprocket",
            },
        };

        const previewMessage = await m.channel.send({
            content: "*This is a preview message.*",
            embeds: [messageEmbed],
        });
        messagesToDelete.push(previewMessage);
        let confirmationPreview: Message;

        let title: string;
        let content: string;

        wizard.add(async (message: Message): Promise<WizardFunctionOutput> => {
            messagesToDelete.push(message);
            title = message.content;

            messageEmbed.title = title;
            await previewMessage.edit({
                content: "*This is a preview message.*",
                embeds: [messageEmbed],
            });

            messagesToDelete.push(await m.channel.send("Enter a description for the status message."));

            return [WizardExitStatus.SUCCESS];
        });

        wizard.add(async (message: Message): Promise<WizardFunctionOutput> => {
            messagesToDelete.push(message);
            content = message.content;

            messageEmbed.description = content;
            await previewMessage.delete();

            confirmationPreview = await m.channel.send({
                embeds: [messageEmbed],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "Send Update",
                                style: 3,
                                customId: "confirm",
                            },
                            {
                                type: 2,
                                label: "Cancel",
                                style: 4,
                                customId: "cancel",
                            },
                        ],

                    },
                ],
            });
            messagesToDelete.push(confirmationPreview);

            wizard.add(async (interaction: MessageComponentInteraction): Promise<WizardFunctionOutput> => {
                if (interaction.customId === "confirm") {
                    await statusChannel.send({
                        embeds: [
                            {
                                title: title,
                                description: content,
                                color: 0xF5C04E,
                                timestamp: new Date(),
                                thumbnail: {
                                    url: "https://avatars.githubusercontent.com/u/82424226?s=200&v=4",
                                },
                                footer: {
                                    text: "Sprocket",
                                },
                            },
                        ],
                    });
                    return [WizardExitStatus.SUCCESS];
                }
                return [WizardExitStatus.EXIT];
            }, {
                collectorType: WizardType.COMPONENT,
                collectorTarget: confirmationPreview,
                filter: (interaction: MessageComponentInteraction) => interaction.user.id === m.author.id,
            });

            return [WizardExitStatus.SUCCESS];
        });

        wizard.finally(async () => {
            (m.channel as TextChannel).bulkDelete(messagesToDelete).catch(() => { /* Do nothing */});
        });

        wizard.onFail(async () => {
            await m.channel.send("Canceled.");
        });

        messagesToDelete.push(await m.channel.send("Enter a title for the status message."));
        await wizard.start();
    }
}
