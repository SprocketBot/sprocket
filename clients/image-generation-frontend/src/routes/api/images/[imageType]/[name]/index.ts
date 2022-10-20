import type {EndpointOutput, Request, Response} from "@sveltejs/kit";

import config from "$src/config";
import {getClient} from "$utils/server/minio";

export const GET = async ({params}: Request): Promise<EndpointOutput> => {
    const mClient = getClient();
    const {imageType, name} = params;
    try {
        const objectStats = await mClient.statObject(
            config.minio.bucket,
            `${imageType}/${name}/template.svg`,
        ); // this line checks that file exists
        const getURL: string = await mClient.presignedGetObject(
            config.minio.bucket,
            `${imageType}/${name}/template.svg`,
            60 * 2,
        );
        return {
            status: 200,
            body: JSON.stringify({
                getURL: getURL,
                size: objectStats.size,
            }),
        };
    } catch (err) {
        return {
            status: 500,
            body: err,
        };
    }
};

export const POST = async ({params}: Request): Promise<Response> => {
    const mClient = getClient();
    const {imageType, name} = params;
    try {
        const result = await mClient.presignedPutObject(
            config.minio.bucket,
            `${imageType}/${name}/template.svg`,
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
