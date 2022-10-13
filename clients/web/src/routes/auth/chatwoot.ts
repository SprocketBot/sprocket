import type {RequestHandler} from "@sveltejs/kit";
import {sha256} from "js-sha256";

import {config} from "$lib/utils";

export const GET: RequestHandler = async ({locals}) => {
    const {user} = locals;

    const identifier = user.userId.toString();
    const key = config.server.chatwoot.hmacKey;

    const hash = sha256.hmac(key, identifier);

    return {
        body: {identifier, hash},
    };
};
