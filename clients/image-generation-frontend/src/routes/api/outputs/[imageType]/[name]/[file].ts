import type {RequestHandler} from "@sveltejs/kit";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "$utils/server/s3";
import config from "$src/config"
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const expiresIn = 60 * 2

export const GET: RequestHandler = async ({params}) => {
    const {imageType, name, file} = params;

    try {
        const commandOpts = {
            Bucket: config.s3.bucket,
            Key: `${imageType}/${name}/outputs/${file}`,
        }

        const response = await client.send(new HeadObjectCommand(commandOpts))
        const size = response.ContentLength

        const getURL = await getSignedUrl(client, new GetObjectCommand(commandOpts), {expiresIn})

        return {
            headers: {},
            status: 200,
            body: JSON.stringify({
                getURL,
                size,
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
