import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {readFileSync} from "fs";

import {AuthorizationModule} from "./authorization/authorization.module";
import {ConfigurationModule} from "./configuration/configuration.module";
import {DraftModule} from "./draft/draft.module";
import {FranchiseModule} from "./franchise/franchise.module";
import {GameModule} from "./game/game.module";
import {IdentityModule} from "./identity/identity.module";
import {ImageGenModule} from "./image-gen/image-gen.module";
import {MledbModule} from "./mledb/mledb.module";
import {MledbBridgeModule} from "./mledb-bridge/mledb_bridge.module";
import {OrganizationModule} from "./organization/organization.module";
import {SchedulingModule} from "./scheduling/scheduling.module";
import {WebhookModule} from "./webhook/webhook.module";

const modules = [
    AuthorizationModule,
    ConfigurationModule,
    DraftModule,
    FranchiseModule,
    GameModule,
    IdentityModule,
    OrganizationModule,
    SchedulingModule,
    MledbModule,
    ImageGenModule,
    MledbBridgeModule,
    WebhookModule,
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
];

@Module({
    imports: modules,
    exports: modules,
})
export class DatabaseModule {}
