import type {Request, Response} from "@sveltejs/kit";

import config from "$src/config";
import {getClient} from "$utils/server/minio";

export const GET = async ({params}: Request): Promise<Response> => {
    const mClient = getClient();
    try {
        const {imageType, name, file} = params;
        const objectStats = await mClient.statObject(
            config.minio.bucket,
            `${imageType}/${name}/outputs/${file}`,
        ); // this line checks that file exists
        const getURL: string = await mClient.presignedGetObject(
            config.minio.bucket,
            `${imageType}/${name}/outputs/${file}`,
            60 * 2,
        );

        return {
            headers: {},
            status: 200,
            body: JSON.stringify({
                getURL: getURL,
                size: objectStats.size,
            }),
        };
    } catch (err) {
        return {
            headers: {},
            status: 500,
            body: err,
        };
    }
};
