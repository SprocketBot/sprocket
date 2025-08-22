import {browser} from "$app/env";
import type {Config, Stack} from "./types";

export let config: Config;

export const loadConfig = async (): Promise<Config> => {
    if (browser) throw new Error("Can't call `loadConfig` on the client! Use `$session.config`");

    // Import dynamically so these modules aren't loaded on the client
    const _config = (await import("config")).default;
    const fs = await import("fs");
    const dotenv = await import("dotenv");

    // Load .env file if it exists
    dotenv.config();

    if (config) return config;

    const stack = _config.has("stack") ? _config.get<Stack>("stack") : "local";

    // Helper function to get chatwoot HMAC key from env or file
    function getChatwootHmacKey() {
        if (process.env.CHATWOOT_HMAC_KEY) {
            return process.env.CHATWOOT_HMAC_KEY.trim();
        }
        if (fs.existsSync("secret/chatwoot-hmac-key.txt")) {
            return fs.readFileSync("secret/chatwoot-hmac-key.txt").toString().trim();
        }
        throw new Error("CHATWOOT_HMAC_KEY environment variable or secret/chatwoot-hmac-key.txt file required");
    }

    config = {
        client: {
            gqlUrl: process.env.CLIENT_GQL_URL || _config.get<string>("client.gqlUrl"),
            secure: (process.env.CLIENT_SECURE === "true") || _config.get<boolean>("client.secure"),
            chatwoot: {
                enabled: (process.env.CLIENT_CHATWOOT_ENABLED === "true") || _config.get<boolean>("client.chatwoot.enabled"),
                url: process.env.CLIENT_CHATWOOT_URL || _config.get<string>("client.chatwoot.url"),
                websiteToken: process.env.CLIENT_CHATWOOT_WEBSITE_TOKEN || _config.get<string>("client.chatwoot.websiteToken"),
            },
            stack,
        },
        server: {
            chatwoot: {
                hmacKey: getChatwootHmacKey(),
            },
            stack,
        },
    };
    
    return config;
};
