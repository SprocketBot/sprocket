import {readFileSync, existsSync} from "fs";
import dotenv from "dotenv";

// Load .env file if it exists
dotenv.config();

// Helper functions to get secrets from env or file
function getMinioAccess() {
    if (process.env.MINIO_ACCESS_KEY) {
        return process.env.MINIO_ACCESS_KEY.trim();
    }
    if (existsSync("./secret/minio-access.txt")) {
        return readFileSync("./secret/minio-access.txt").toString().trim();
    }
    throw new Error("MINIO_ACCESS_KEY environment variable or ./secret/minio-access.txt file required");
}

function getMinioSecret() {
    if (process.env.MINIO_SECRET_KEY) {
        return process.env.MINIO_SECRET_KEY.trim();
    }
    if (existsSync("./secret/minio-secret.txt")) {
        return readFileSync("./secret/minio-secret.txt").toString().trim();
    }
    throw new Error("MINIO_SECRET_KEY environment variable or ./secret/minio-secret.txt file required");
}

function getDbPassword() {
    if (process.env.DB_PASSWORD) {
        return process.env.DB_PASSWORD.trim();
    }
    if (existsSync("./secret/db-secret.txt")) {
        return readFileSync("./secret/db-secret.txt").toString().trim();
    }
    throw new Error("DB_PASSWORD environment variable or ./secret/db-secret.txt file required");
}

const config = JSON.parse(readFileSync("./src/config.json").toString());
config.minio.access = getMinioAccess();
config.minio.secret = getMinioSecret();
config.knex.password = getDbPassword();

export default config;
