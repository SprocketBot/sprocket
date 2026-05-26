import {forwardRef, Module} from "@nestjs/common";
import {Client} from "discord.js";
import {GatewayIntentBits} from "discord-api-types";
import {readFile} from "fs/promises";

import {CommandsModule} from "../marshal";
import {DiscordService} from "./discord.service";

@Module({
    imports: [forwardRef(() => CommandsModule)],
    providers: [
        {
            provide: "DISCORD_CLIENT",
            useFactory: async (): Promise<Client> => {
                const bot_client = new Client({
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.GuildMessageReactions,
                        GatewayIntentBits.GuildMembers,
                    ],
                });
                if (process.env.DISABLE_DISCORD_LOGIN === "true") return bot_client;
                const bot_token = process.env.DISCORD_BOT_TOKEN?.trim()
                    ?? (await readFile("./secret/bot-token.txt")).toString().trim();
                await bot_client.login(bot_token);
                return bot_client;
            },
        },
        DiscordService,
    ],
    exports: ["DISCORD_CLIENT"],
})
export class DiscordModule {}
