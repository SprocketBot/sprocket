import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {readFileSync} from "fs";

import {authorizationEntities, AuthorizationModule} from "./authorization/authorization.module";
import {configurationEntities, ConfigurationModule} from "./configuration/configuration.module";
import {draftEntities, DraftModule} from "./draft/draft.module";
import {franchiseEntities, FranchiseModule} from "./franchise/franchise.module";
import {gameEntities, GameModule} from "./game/game.module";
import {identityEntities, IdentityModule} from "./identity/identity.module";
import {imageGenerationEntities, ImageGenModule} from "./image-gen/image-gen.module";
import {mledbEntities} from "./mledb";
import {MledbModule} from "./mledb/mledb.module";
import {organizationEntities, OrganizationModule} from "./organization/organization.module";
import {schedulingEntities, SchedulingModule} from "./scheduling/scheduling.module";

const sprocketEntities = [
    ...authorizationEntities,
    ...configurationEntities,
    ...draftEntities,
    ...franchiseEntities,
    ...gameEntities,
    ...identityEntities,
    ...imageGenerationEntities,
    ...organizationEntities,
    ...schedulingEntities,
];

export const mledbConnectionName = "mledb";

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
    // SprocketDB
    TypeOrmModule.forRoot({
        type: "postgres",
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: readFileSync("./secret/db-password.txt").toString()
            .trim(),
        database: config.db.database,
        logging: config.db.enable_logs,
        entities: sprocketEntities,
    }),
    // MLEDB
    TypeOrmModule.forRoot({
        name: mledbConnectionName,
        type: "postgres",
        host: config.mledb.host,
        port: config.mledb.port,
        username: config.mledb.username,
        password: readFileSync("./secret/mledb-password.txt").toString()
            .trim(),
        database: config.mledb.database,
        logging: config.mledb.enable_logs,
        entities: mledbEntities,
    }),
];

@Module({
    imports: modules,
    exports: modules,
})
export class DatabaseModule { }
