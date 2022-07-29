import type {RequestHandler} from "@sveltejs/kit";
import {config} from "$lib/utils";
import {getCrypto} from "../../lib/utils/getCrypto";

export const GET: RequestHandler = async ({locals}) => {
    const {user} = locals;

    const identifier = user.userId.toString();
    const key = config.server.chatwoot.hmacKey;

    const crypto = await getCrypto();
    const hash = crypto.createHmac("sha256", key).update(identifier)
        .digest("hex");

    return {
        body: {identifier, hash},
    };
};
