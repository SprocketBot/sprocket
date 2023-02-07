import {readFileSync} from "fs";

const config = JSON.parse(readFileSync("./src/config.json").toString());
config.s3.accessKeyId = readFileSync("./secret/s3-access-key-id.txt").toString().trim()
config.s3.secretAccessKey = readFileSync("./secret/s3-secret-access-key.txt").toString().trim()
config.knex.password = readFileSync("./secret/db-secret.txt").toString().trim()

export default config;
