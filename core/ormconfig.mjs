import config from "config";
import fs from "fs";
import {DataSource} from "typeorm";
import dotenv from "dotenv";

// Load .env file if it exists
dotenv.config();

// Helper function to get database password using the same pattern as ConfigResolver
function getDbPassword() {
    // 1. Check environment variable first
    if (process.env.DB_PASSWORD) {
        return process.env.DB_PASSWORD.trim();
    }

    // 2. Check file-based secret
    if (fs.existsSync("./secret/db-password.txt")) {
        return fs.readFileSync("./secret/db-password.txt").toString().trim();
    }

    // 3. Fall back to config library if available
    if (config.has("db.password")) {
        return config.get("db.password");
    }

    throw new Error("DB_PASSWORD environment variable, ./secret/db-password.txt file, or db.password config required");
}

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || config.get("db.host"),
    port: parseInt(process.env.DB_PORT) || config.get("db.port"),
    username: process.env.DB_USERNAME || config.get("db.username"),
    password: getDbPassword(),
    database: process.env.DB_DATABASE || config.get("db.database"),
    schema: "public",
    entities: ["dist/database/**/*.model.js"],
    migrationsTableName: "migrations",
    migrations: ["dist/migrations/*.js"],
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    cli: {
        migrationsDir: "migrations"
    }

})
