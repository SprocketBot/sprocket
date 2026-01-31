import {Logger} from "@nestjs/common";
import {CoreEndpoint, ResponseStatus} from "@sprocketbot/common";
import {Message} from "discord.js";

import {Command, Marshal} from "../../marshal";

export class DatabaseSyncMarshal extends Marshal {
    private readonly logger = new Logger(DatabaseSyncMarshal.name);

    @Command({
        name: "syncNames",
        args: [],
        docs: "Sync all player names in the main MLE server.",
    })
    async syncNames(m: Message): Promise<void> {
        if (
            ![
                "353194025995730945", // Adi
                "105408136285818880", // Hyper
                "423850557334093827", // Hoos
                "470703275163779084", // Achilles
                "243430304319143936", // Kunics
            ].includes(m.author.id)
        ) return;

        await m.reply("Starting sync...");

        const serverId = "172404472637685760"; // MLE Main
        const server = await this.botClient.guilds.fetch(serverId);
        await server.members.fetch();

        for (const member of server.members.cache.values()) {
            const nicknameRequest = await this.coreService.send(CoreEndpoint.GetNicknameByDiscordUser, {
                discordId: member.id,
            });
            if (nicknameRequest.status === ResponseStatus.ERROR) {
                this.logger.log(`Failed to get nickname for ${member.id}`);
                continue;
            }

            if (member.nickname === nicknameRequest.data) continue;

            await member.setNickname(nicknameRequest.data).catch(err => {
                this.logger.error(err);
            });
        }

        await m.reply("Sync complete!");
    }
}
