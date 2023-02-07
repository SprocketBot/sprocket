import type {RequestHandler} from "@sveltejs/kit";
import { client } from "$utils/server/s3";
import config from "$src/config"
import { ListObjectsCommand } from "@aws-sdk/client-s3";

export const GET: RequestHandler = async ({params}) => {
    const {imageType, name} = params;

    try {
        const response = await client.send(new ListObjectsCommand({
            Bucket: config.s3.bucket,
            Prefix: `${imageType}/${name}/outputs/`,
        }))

        const objects = (response.Contents ?? []).map(o => {
            const tokens = o.Key.split("/")
            return tokens[tokens.length - 1]
        }).filter(x => x !== undefined)

        return {
            headers: {},
            status: 200,
            body: JSON.stringify(objects),
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }
};
