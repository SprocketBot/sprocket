import {DataSource} from "typeorm";

import {config} from "@sprocketbot/common";

export default new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    schema: "public",
    entities: ["src/database/!(mledb)/**/*.model.ts "],
    migrationsTableName: "migrations",
    migrations: ["migrations/*.ts"],
    cli: {
        migrationsDir: "migrations"
    }

})
