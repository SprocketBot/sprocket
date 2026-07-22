import {browser} from "$app/env";
import type {Config, Stack} from "./types";

export let config: Config;

export const loadConfig = async (): Promise<Config> => {
    if (browser) throw new Error("Can't call `loadConfig` on the client! Use `$session.config`");

    // Import dynamically so these modules aren't loaded on the client
    const _config = (await import("config")).default;
    const dotenv = await import("dotenv");

    // Load .env file if it exists
    dotenv.config();

    if (config) return config;

    const stack = _config.has("stack") ? _config.get<Stack>("stack") : "local";

    config = {
        client: {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            gqlUrl: process.env.CLIENT_GQL_URL || _config.get<string>("client.gqlUrl"),
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            secure: process.env.CLIENT_SECURE === "true" || _config.get<boolean>("client.secure"),
            stack: stack,
        },
        server: {
            stack,
        },
    };

    return config;
};
