import {Module} from "@nestjs/common";
import {InjectDataSource, TypeOrmModule} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {readFileSync} from "fs";
import {DataSource} from "typeorm";

import {MledbModule} from "./mledb/mledb.module";
import {MledbBridgeModule} from "./mledb-bridge/mledb_bridge.module";

const modules = [
    TypeOrmModule.forRoot({
        type: "postgres",
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: readFileSync("./secret/db-password.txt").toString().trim(),
        database: config.db.database,
        autoLoadEntities: true,
        logging: config.db.enable_logs,
    }),
    MledbModule,
    MledbBridgeModule,
];

@Module({
    imports: modules,
    exports: modules,
})
export class DatabaseModule {
    constructor(@InjectDataSource() private dataSource: DataSource) {}
}
