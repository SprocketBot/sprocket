import {Module} from "@nestjs/common";
import {Client} from "discord.js";
import {readFile} from "fs/promises";

import {MarshalModule} from "../marshal";
import {DiscordService} from "./discord.service";


@Module({
    imports: [
        MarshalModule,
    ],
    providers: [
        {
            provide: "DISCORD_CLIENT",
            useFactory: async (): Promise<Client> => {
                const bot_token = (await readFile("./secret/bot-token.txt")).toString();
                const bot_client = new Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]});
                await bot_client.login(bot_token);
                return bot_client;
            },
        },
        DiscordService,
    ],
    exports: ["DISCORD_CLIENT"],
})
export class DiscordModule {}
