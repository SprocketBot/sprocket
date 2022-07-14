import type {EndpointOutput, Request} from "@sveltejs/kit";
import { getClient } from "$utils/server/minio";
import config from "$src/config"

export const get = async ({url}: Request): Promise<EndpointOutput> => {
    const mClient = getClient();
    if (!url.searchParams.has("reportCode")) {
        return {
            status: 400,
            body: {
                error: "missing reportCode",
            },
        };
    }
    try {
        const reports = await new Promise<unknown[]>((resolve, reject) => {
            const output = [];
            mClient.listObjects(config.minio.bucket, `${url.searchParams.get("reportCode")}/`)
                .on("data", d => {
                    if (d.name && d.name.endsWith(".svg")) {
                        output.push(d.name.split("/")[1]);
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
            body: JSON.stringify(reports),
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }

    
};
