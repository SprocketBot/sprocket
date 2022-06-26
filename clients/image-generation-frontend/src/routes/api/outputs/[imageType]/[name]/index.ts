import type {
    EndpointOutput, Response, Request,
} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const get = async ({params}: Request): Promise<EndpointOutput> => {
    const mClient = getClient();
    const {imageType, name} = params;
    try {
        const outputs = await new Promise<string[]>((resolve, reject) => {
            const output = [];
            mClient.listObjects(config.minio.bucket, `${imageType}/${name}/outputs/`)
                .on("data", d => {
                    if (d.name) {
                        output.push(d.name.split("/")[3]);
                    }
                })
                .on("end", () => { resolve(output) })
                .on("error", e => {
                    reject(e);
                });
        });

        return {
            headers: {},
            status: 200,
            body: JSON.stringify(outputs),
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }
};

export const post = async ({params}: Request): Promise<Response> => {
    const mClient = getClient();
    const {imageType, filename} = params;
    try {
        const result = await mClient.presignedPutObject(config.minio.bucket, `${imageType}/${filename}`, 60 * 2);
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
