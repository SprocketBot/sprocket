import type {RequestHandler} from "@sveltejs/kit";
import { client } from "$utils/server/s3";
import config from "$src/config"
import { ListObjectsCommand } from "@aws-sdk/client-s3";

export const GET: RequestHandler = async () => {
    try {
        const response = await client.send(new ListObjectsCommand({
            Bucket: config.s3.bucket,
            Delimiter: "/",
        }))
        console.log(response.Contents)
        const images = (response.CommonPrefixes ?? []).map(o => {
            return o.Prefix?.split("/")[0]
        }).filter(x => x !== undefined)
        
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
