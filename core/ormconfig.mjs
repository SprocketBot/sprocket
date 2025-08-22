import config from "config";
import fs from "fs";
import {DataSource} from "typeorm";
import dotenv from "dotenv";

// Load .env file if it exists
dotenv.config();

// Helper function to get database password from env or file
function getDbPassword() {
    if (process.env.DB_PASSWORD) {
        return process.env.DB_PASSWORD.trim();
    }
    if (fs.existsSync("./secret/db-password.txt")) {
        return fs.readFileSync("./secret/db-password.txt").toString().trim();
    }
    throw new Error("DB_PASSWORD environment variable or ./secret/db-password.txt file required");
}

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || config.get("db.host"),
    port: parseInt(process.env.DB_PORT) || config.get("db.port"),
    username: process.env.DB_USERNAME || config.get("db.username"),
    password: getDbPassword(),
    database: process.env.DB_DATABASE || config.get("db.database"),
    schema: "public",
    entities: ["src/database/!(mledb)/**/*.model.ts "],
    migrationsTableName: "migrations",
    migrations: ["migrations/*.ts"],
    cli: {
        migrationsDir: "migrations"
    }

})
