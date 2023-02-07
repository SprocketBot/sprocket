import { S3Client } from "@aws-sdk/client-s3";

import config from "../../config";

export const client = new S3Client({
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});
