import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {readFileSync} from "fs";

import {config} from "../util/config";
import {AuthorizationModule} from "./authorization/authorization.module";
import {ConfigurationModule} from "./configuration/configuration.module";
import {DraftModule} from "./draft/draft.module";
import {FranchiseModule} from "./franchise/franchise.module";
import {GameModule} from "./game/game.module";
import {IdentityModule} from "./identity/identity.module";
import {OrganizationModule} from "./organization/organization.module";
import {SchedulingModule} from "./scheduling/scheduling.module";
import { MledbModule } from './mledb/mledb.module';

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
    TypeOrmModule.forRoot({
        type: "postgres",
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: readFileSync("./secret/db-password.txt").toString(),
        database: config.db.database,
        autoLoadEntities: true,
        logging: config.db.enable_logs,
    }),
];

@Module({
    imports: modules,
    exports: modules,
})
export class DatabaseModule { }
