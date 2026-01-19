import { Client } from 'minio';

import config from '../../config';

export function getClient(): Client {
  return new Client({
    endPoint: config.minio.endpoint,
    port: config.minio.port,
    useSSL: config.minio.ssl,
    accessKey: config.minio.access,
    secretKey: config.minio.secret,
  });
}
