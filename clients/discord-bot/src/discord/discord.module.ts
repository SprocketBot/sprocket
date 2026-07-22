import {
    forwardRef, Logger, Module,
} from "@nestjs/common";
import {config} from "@sprocketbot/common";
import {Client} from "discord.js";
import {GatewayIntentBits} from "discord-api-types";

import {CommandsModule} from "../marshal";
import {DiscordService} from "./discord.service";

const localPlaceholderTokens = new Set([
    "local_dev_placeholder",
    "your_discord_bot_token_here",
]);

const log = new Logger("DiscordModule");

@Module({
    imports: [forwardRef(() => CommandsModule)],
    providers: [
        {
            provide: "DISCORD_CLIENT",
            useFactory: async (): Promise<Client> => {
                const bot_token = config.bot.token;
                const bot_client = new Client({
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.GuildMessageReactions,
                        GatewayIntentBits.GuildMembers,
                    ],
                });
                if (localPlaceholderTokens.has(bot_token)) {
                    log.warn("Skipping Discord login because DISCORD_BOT_TOKEN is a local placeholder.");
                    return bot_client;
                }
                await bot_client.login(bot_token);
                return bot_client;
            },
        },
        DiscordService,
    ],
    exports: ["DISCORD_CLIENT"],
})
export class DiscordModule {}
