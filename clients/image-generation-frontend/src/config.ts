import {readFileSync} from "fs";

const config = JSON.parse(readFileSync("./src/config.json").toString());
config.minio.access = readFileSync("./secret/minio-access.txt")
    .toString()
    .trim();
config.minio.secret = readFileSync("./secret/minio-secret.txt")
    .toString()
    .trim();
config.knex.password = readFileSync("./secret/db-secret.txt").toString().trim();

export default config;
