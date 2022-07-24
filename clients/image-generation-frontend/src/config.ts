import {readFileSync} from "fs";

const config = JSON.parse(readFileSync("./src/config.json").toString());
config.minio.access = readFileSync("./secret/minio-access.txt").toString()
config.minio.secret = readFileSync("./secret/minio-secret.txt").toString()
config.knex.password = readFileSync("./secret/db-secret.txt").toString()

export default config;
