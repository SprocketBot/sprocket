import {browser} from "$app/env";

import type {Config, Stack} from "./types";

export let config: Config;

export const loadConfig = async (): Promise<Config> => {
    if (browser) throw new Error("Can't call `loadConfig` on the client! Use `$session.config`");

    // Import dynamically so these modules aren't loaded on the client
    const _config = (await import("config")).default;
    const fs = await import("fs");

    if (config) return config;

    const stack = (import.meta.env.VITE_STACK ?? "local") as Stack;

    config = {
        client: {
            gqlUrl: _config.get<string>("client.gqlUrl"),
            secure: _config.get<boolean>("client.secure"),
            chatwoot: {
                enabled: _config.get<boolean>("client.chatwoot.enabled"),
                url: _config.get<string>("client.chatwoot.url"),
                websiteToken: _config.get<string>("client.chatwoot.websiteToken"),
            },
            stack: stack,
        },
        server: {
            chatwoot: {
                hmacKey: fs.readFileSync("secret/chatwoot-hmac-key.txt").toString()
                    .trim(),
            },
            stack: stack,
        },
    };
    
    return config;
};
