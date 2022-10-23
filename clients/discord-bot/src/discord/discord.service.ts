import {Inject, Injectable, Logger} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Client} from "discord.js";

import {CommandManagerService} from "../marshal/commands/command-manager.service";

@Injectable()
export class DiscordService {
    private readonly log = new Logger(DiscordService.name);

    constructor(@Inject("DISCORD_CLIENT") bot: Client, commandManagerService: CommandManagerService) {
        bot.on("ready", () => {
            this.log.log(`Bot Online as ${bot.user?.username}; using prefix ${config.bot.prefix}`);
        });
        bot.on("messageCreate", e => {
            commandManagerService.handleMessage(e).catch(this.log.error.bind(this.log));
        });
    }
}
