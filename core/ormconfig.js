const config = require("config");
const fs = require("fs");

module.exports = {
    type: "postgres",
    host: config.get("db.host"),
    port: config.get("db.port"),
    username: config.get("db.username"),
    password: fs.readFileSync("./secret/db-password.txt").toString().trim(),
    database: config.get("db.database"),
    entities: ["src/database/**/*.model.ts"],
    migrationsTableName: "migrations",
    migrations: ["migrations/*.ts"],
    cli: {
        migrationsDir: "migrations"
    }
}
