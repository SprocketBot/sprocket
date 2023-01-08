import config from "config";
import fs from "fs";
import {DataSource} from "typeorm";

export default new DataSource({
    type: "postgres",
    host: config.get("db.host"),
    port: config.get("db.port"),
    username: config.get("db.username"),
    password: fs.readFileSync("./secret/db-password.txt").toString().trim(),
    database: config.get("db.database"),
    schema: "public",
    entities: ["src/**/!(mledb)/database/*.entity.ts"],
    migrationsTableName: "migrations",
    migrations: ["migrations/*.ts"],
    cli: {
        migrationsDir: "migrations"
    }

})
