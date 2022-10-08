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
                const bot_token = (await readFile("./secret/bot-token.txt"))
                    .toString()
                    .trim();
                const bot_client = new Client({
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.GuildMessageReactions,
                        GatewayIntentBits.GuildMembers,
                    ],
                });
                await bot_client.login(bot_token);
                return bot_client;
            },
        },
        DiscordService,
    ],
    exports: ["DISCORD_CLIENT"],
})
export class DiscordModule {}
