import type {RequestHandler} from "@sveltejs/kit";
import { client } from "$utils/server/s3";
import config from "$src/config"
import { ListObjectsCommand } from "@aws-sdk/client-s3";

export const GET: RequestHandler = async ({params}) => {
    const {imageType} = params;

    try {
        const response = await client.send(new ListObjectsCommand({
            Bucket: config.s3.bucket,
            Delimiter: "/",
            Prefix: `${imageType}/`,
        }))
        const names = (response.CommonPrefixes ?? []).map(o => {
            return o.Prefix?.split("/")[1]
        }).filter(x => x !== undefined)

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
