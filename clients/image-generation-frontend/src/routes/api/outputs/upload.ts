import type {RequestHandler} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const POST: RequestHandler = async ({request: {body}}) => {
    const mClient = getClient();
    const data = JSON.parse(body.toString());
    try {
        const result = await mClient.presignedPutObject(config.minio.bucket, `${data.reportType}/${data.reportName}`, 60 * 2);
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
