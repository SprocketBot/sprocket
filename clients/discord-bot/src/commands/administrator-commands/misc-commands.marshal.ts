import {Logger} from "@nestjs/common";
import {Message} from "discord.js";

import {
    Command, Marshal, MarshalCommandContext,
} from "../../marshal";
import type {CommandErrorType} from "../../marshal/command-error";
import {CommandError} from "../../marshal/command-error";

export class MiscCommandsMarshal extends Marshal {
    private readonly logger = new Logger(MiscCommandsMarshal.name);

    @Command({
        name: "ping",
        docs: "A noop command to check if the bot is up",
        args: [],
    })
    async ping(m: Message): Promise<void> {
        await m.reply("Pong!");
    }

    @Command({
        name: "error",
        docs: "Triggers an error",
        longDocs: "Triggers an error for debugging and testing of command error handling/reporting",
        args: [
            {
                name: "type",
                type: "string", // TODO enum type parsing
                docs: "The type of error to throw (CommandErrorType)",
            },
        ],
    })
    async error(m: Message, context: MarshalCommandContext): Promise<void> {
        const type = context.args.type as CommandErrorType;

        await m.reply(`Triggering an error of type ${type}...`);

        throw new CommandError(
            type,
            "you used the `error` command",
            "thank Zach for building this error handling",
        );
    }

    @Command({
        name: "embed",
        docs: "Generates a test embed",
        longDocs: "Generates a test embed for an organization using their organization branding",
        args: [
            {
                name: "orgId",
                type: "number",
                docs: "The ID of the organization to generate the embed for",
            },
        ],
    })
    async embed(m: Message, c: MarshalCommandContext): Promise<void> {
        const orgId = c.args.orgId as number;

        const embed = await this.embedService.embed(
            {
                title: "My Embed Title",
                description:
          "My Embed DescriptionLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales ex et nibh volutpat, vel mattis magna feugiat.",
                fields: [
                    {
                        name: "Field 1",
                        value: "Field 1 content",
                    },
                    {
                        name: "Field 2",
                        value: "Field 2 content",
                    },
                    {
                        name: "Field 3",
                        value: "Field 3 content",
                    },
                    {
                        name: "Field 4",
                        value: "Field 4 content",
                        inline: true,
                    },
                    {
                        name: "Field 5",
                        value: "Field 5 content",
                        inline: true,
                    },
                ],
            },
            orgId,
        );

        await m.reply({embeds: [embed] });
    }
}
