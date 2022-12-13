import {Module} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

import {MledbModule} from "../mledb/database/mledb.module";
import {MledbBridgeModule} from "../mledb/mledb-bridge/mledb_bridge.module";

const modules = [MledbModule, MledbBridgeModule];

@Module({
    imports: modules,
    exports: modules,
})
export class DatabaseModule {
    constructor(@InjectDataSource() private dataSource: DataSource) {}
}
