import type {RequestHandler} from "@sveltejs/kit";
import { client } from "$utils/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "$src/config"
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const expiresIn = 60 * 2

export const GET: RequestHandler = async ({params}) => {
    const {imageType, name} = params;
    const key = `${imageType}/${name}/template.svg`;
    try {
        const commandOpts = {
            Bucket: config.s3.bucket,
            Key: key,
        }
        const response = await client.send(new HeadObjectCommand(commandOpts))
        const size = response.ContentLength

        const getURL = await getSignedUrl(client, new GetObjectCommand(commandOpts), { expiresIn })

        return {
            status: 200,
            body: JSON.stringify({
                getURL,
                size,
            }),
        };
    } catch (err) {
        return {
            status: 500,
            body: err,
        };
    }
};

export const POST: RequestHandler = async ({params}) => {
    const {imageType, name} = params;
    const key = `${imageType}/${name}/template.svg`;

    try {
        const commandOpts = {
            Bucket: config.s3.bucket,
            Key: key,
        }

        const putUrl = await getSignedUrl(client, new PutObjectCommand(commandOpts), { expiresIn })

        return {
            headers: {},
            status: 200,
            body: putUrl,
        };
    } catch {
        return {
            headers: {},
            status: 500,
        };
    }
};
