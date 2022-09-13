import type {EndpointOutput} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const GET = async (): Promise<EndpointOutput> => {
    const mClient = getClient();
    try {
        const images = await new Promise<string[]>((resolve, reject) => {
            const output = [];
            mClient.listObjects(config.minio.bucket)
                .on("data", d => {
                    if (d.prefix) {
                        output.push(d.prefix.split("/")[0]);
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
            body: images,
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }
};
