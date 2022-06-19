import {Logger} from "@nestjs/common";
import {
    CoreEndpoint, ResponseStatus,
} from "@sprocketbot/common";
import {Message} from "discord.js";

import {
    Command, Marshal, MarshalCommandContext,
} from "../../marshal";

export class ReportCardMarshal extends Marshal {
    private readonly logger = new Logger(ReportCardMarshal.name);

    @Command({
        name: "reportCard",
        docs: "Generates a report card for the member's latest scrim.",
        aliases: ["rc"],
        args: [],
    })
    async reportCard(m: Message, c: MarshalCommandContext): Promise<void> {
        if (!m.guild) return;

        const organizationResult = await this.coreService.send(CoreEndpoint.GetOrganizationByDiscordGuild, {
            guildId: m.guild.id,
        });
        if (organizationResult.status === ResponseStatus.ERROR) {
            await m.reply("Couldn't resolve organization.");
            return;
        }

        await m.reply(organizationResult.data.id.toString());
    }
}
