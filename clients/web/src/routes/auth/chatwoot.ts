import type {RequestHandler} from "@sveltejs/kit";
import {config} from "$lib/utils";
import {sha256} from "js-sha256";

export const GET: RequestHandler = async ({locals}) => {
    const {user} = locals;

    // Defensive check: return early if user or userId is missing
    if (!user?.userId) {
        return {
            status: 401,
            body: {error: "Not authenticated"},
        };
    }

    const identifier = user.userId.toString();
    const key = config.server.chatwoot.hmacKey;

    // If no HMAC key is configured, return an error instead of failing silently
    if (!key) {
        return {
            status: 500,
            body: {error: "Chatwoot HMAC key not configured"},
        };
    }

    const hash = sha256.hmac(key, identifier);

    return {
        body: {identifier, hash},
    };
};
