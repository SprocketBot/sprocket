import type {EndpointOutput, Request} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const get = async ({params}: Request): Promise<EndpointOutput> => {
    const mClient = getClient();
    const {imageType} = params;
    try {
        const names = await new Promise<string[]>((resolve, reject) => {
            const output = [];
            mClient.listObjects(config.minio.bucket, `${imageType}/`)
                .on("data", d => {
                    if (d.prefix) {
                        output.push(d.prefix.split("/")[1]);
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
            body: names,
        };
    } catch (err) {
        console.log(err)
        return {
            headers: {},
            body: err,
            status: 500,
        };
    }
};
