import type {EndpointOutput, Request, Response} from "@sveltejs/kit";

import config from "$src/config";
import {getClient} from "$utils/server/minio";

export const GET = async ({params}: Request): Promise<EndpointOutput> => {
    const mClient = getClient();
    const {imageType, name} = params;
    try {
        const outputs = await new Promise<string[]>((resolve, reject) => {
            const output = [];
            mClient
                .listObjects(
                    config.minio.bucket,
                    `${imageType}/${name}/outputs/`,
                )
                .on("data", d => {
                    if (d.name) {
                        output.push(d.name.split("/")[3]);
                    }
                })
                .on("end", () => {
                    resolve(output);
                })
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

export const POST = async ({params}: Request): Promise<Response> => {
    const mClient = getClient();
    const {imageType, filename} = params;
    try {
        const result = await mClient.presignedPutObject(
            config.minio.bucket,
            `${imageType}/${filename}`,
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
