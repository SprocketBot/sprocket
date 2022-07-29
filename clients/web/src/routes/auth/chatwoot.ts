import type {RequestHandler} from "@sveltejs/kit";
import crypto from "crypto";
import {config} from "$lib/utils";

export const GET: RequestHandler = ({locals}) => {
    const {user} = locals;

    const identifier = user.userId.toString();
    const key = config.server.chatwoot.hmacKey;

    const hash = crypto.createHmac("sha256", key).update(identifier)
        .digest("hex");

    return {
        body: {identifier, hash},
    };
};
