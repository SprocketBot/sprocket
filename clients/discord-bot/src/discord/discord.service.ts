import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import type {ClientEvents} from "discord.js";
import {Client} from "discord.js";

import {EventManagerService} from "../marshal";
import {CommandManagerService} from "../marshal/commands/command-manager.service";

@Injectable()
export class DiscordService {
    private readonly log = new Logger(DiscordService.name);

    constructor(@Inject("DISCORD_CLIENT") bot: Client, commandManagerService: CommandManagerService, eventManagerService: EventManagerService) {
        bot.on("ready", () => { this.log.log(`Bot Online as ${bot.user?.username}; using prefix ${config.bot.prefix}`) });
        bot.on("messageCreate", e => { commandManagerService.handleMessage(e).catch(this.log.error.bind(this.log)) });

        eventManagerService.events.forEach(e => bot.on(e.spec.event, async (...args: ClientEvents[keyof ClientEvents]): Promise<void> => { await e.function(args) }));
    }
}
