import type {Request, Response} from "@sveltejs/kit";

import config from "$src/config";
import {getClient} from "$utils/server/minio";

export const POST = async ({body}: Request): Promise<Response> => {
    const mClient = getClient();
    const data = JSON.parse(body.toString());
    try {
        const result = await mClient.presignedPutObject(
            config.minio.bucket,
            `${data.reportType}/${data.reportName}`,
            60 * 2,
        );
        return {
            headers: {},
            status: 200,
            body: JSON.stringify(result),
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }
};
