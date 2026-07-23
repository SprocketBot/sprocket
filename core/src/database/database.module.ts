import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {config, PostgresModule} from "@sprocketbot/common";

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
import {ReportCardDbModule} from "./report-card/report-card.module";
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
    ReportCardDbModule,
    WebhookModule,
    TypeOrmModule.forRoot({
        type: "postgres",
        host: config.db.host,
        port: config.db.port,
        username: config.db.username,
        password: config.db.password,
        database: config.db.database,
        autoLoadEntities: true,
        logging: config.db.enable_logs,
        // Only enable SSL if not in local development (postgres host != "postgres" or "localhost")
        ssl:
            config.db.host === "postgres" || config.db.host === "localhost"
                ? false
                : {
                        rejectUnauthorized: false,
                    },
        extra: {
            max: config.db.pool_size,
            idleTimeoutMillis: config.db.pool_idle_timeout_ms,
            connectionTimeoutMillis: config.db.pool_connection_timeout_ms,
            maxLifetimeSeconds: Number(config.db.pool_max_lifetime_seconds),
            idle_in_transaction_session_timeout: Number(config.db.idle_in_transaction_timeout_ms),
            application_name: `${config.db.application_name || "sprocket-core"}.typeorm`
                .replace(/[^a-zA-Z0-9_.:-]/g, "_")
                .slice(0, 63),
        },
    }),
];

@Module({
    imports: [...modules, PostgresModule],
    exports: [...modules, PostgresModule],
})
export class DatabaseModule {}
