import type {
    AnalyticsService, CoreService,
} from "@sprocketbot/common";
import {config} from "@sprocketbot/common";
import {Message} from "discord.js";

import type {EmbedService} from "../../embed/embed.service";
import {
    Command, Marshal, MarshalCommandContext,
} from "../../marshal";
import type {CommandManagerService} from "../../marshal/command-manager/command-manager.service";
import * as helpUtil from "./util";

export class HelpMarshal extends Marshal {

    constructor(
        protected readonly cms: CommandManagerService,
        protected readonly coreService: CoreService,
        protected readonly analyticsService: AnalyticsService,
        protected readonly embedService: EmbedService,
    ) {
        super(cms, coreService, analyticsService, embedService);
    }

    @Command({
        name: "help",
        docs: "Lists all available commands",
        longDocs: `Lists all available commands. For more help about a specific command, use \`${config.bot.prefix}help <command name>\``,
        args: [],
    })
    async help(m: Message): Promise<void> {
        const commandSpecs = this.cms.commands.sort(helpUtil.specByNameAndArgs);

        // TODO get organization from author on context?
        const embed = await this.embedService.embed({
            title: "Help",
            fields: commandSpecs.map(helpUtil.specToField),
        });

        await m.reply({embeds: [embed] });
    }

    @Command({
        name: "help",
        docs: "Gets detailed help information for a specified command",
        args: [
            {
                name: "command",
                type: "string",
                docs: "The command to get help for",
            },
        ],
    })
    async helpSpecific(m: Message, c: MarshalCommandContext): Promise<void> {
        const commandName = c.args.command as string;
        const commandSpecs = this.cms.getCommandSpecs(commandName).sort(helpUtil.specByNameAndArgs);

        if (!commandSpecs.length) {
            await m.reply(`Sorry, \`${commandName}\` is not a valid command.`);
            return;
        }

        const fields = helpUtil.specsToFields(commandSpecs);

        // TODO get organization from author on context?
        const embed = await this.embedService.embed({
            title: `Command Help: \`${config.bot.prefix}${commandName}\``,
            fields: fields,
        });

        await m.reply({embeds: [embed] });
    }
}
