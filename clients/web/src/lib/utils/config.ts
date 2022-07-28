import {browser} from "$app/env";
import type {Config} from "./types";

export let config: Config;

export const loadConfig = async (): Promise<Config> => {
    if (browser) throw new Error("Can't call `loadConfig` on the client! Use `$session.config`");

    // Import dynamically so these modules aren't loaded on the client
    const _config = await import("config");
    const fs = await import("fs");

    if (config) return config;

    config = {
        client: {
            gqlUrl: _config.get<string>("client.gqlUrl"),
            secure: _config.get<boolean>("client.secure"),
            chatwoot: {
                enabled: _config.get<boolean>("client.chatwoot.enabled"),
                url: _config.get<string>("client.chatwoot.url"),
                websiteToken: _config.get<string>("client.chatwoot.websiteToken"),
            },
        },
        server: {
            chatwoot: {
                hmacKey: fs.readFileSync("secret/chatwoot-hmac-key.txt").toString().trim(),
            },
        },
    };
    
    return config;
};
