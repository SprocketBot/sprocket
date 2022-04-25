import * as config from "config";

if (!config.has("bot.prefix")) {
    throw new Error("Missing required config bot.prefix");
}

export const appConfig = {
    bot: {
        prefix: config.get<string>("bot.prefix"),
    },
};
