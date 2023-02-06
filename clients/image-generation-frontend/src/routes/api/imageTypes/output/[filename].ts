import type {RequestHandler} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const GET: RequestHandler = async ({params}) => {
    const mClient = getClient();
    try {
        const {imageType, filename} = params;
        const imgBuffer: Buffer = await new Promise((res, rej) => {
            mClient.getObject(config.minio.bucket, `${imageType}/output/${filename}`, (err, dataStream) => {
                const bufs: Buffer[] = [];
                if (err) {
                    rej(err);
                }
                dataStream.on("data", chunk => {
                    bufs.push(chunk);
                });
                dataStream.on("end", () => {
                    res(Buffer.concat(bufs));
                });
                dataStream.on("error", err => {
                    rej(err);
                });
            });
        });
        return {
            headers: {},
            status: 200,
            body: JSON.stringify({blob: imgBuffer.toString("base64")}),
        };
    } catch (e) {
        return {
            headers: {},
            body: e,
            status: 500,
        };
    }
};
