import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {
    EventsModule, NotificationModule, RedisModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {OrganizationModule} from "../organization";
import {EloConsumer} from "./elo.consumer";
import {EloConnectorModule} from "./elo-connector/elo-connector.module";

@Module({
    imports: [
        BullModule.registerQueue({name: "elo"}),
        DatabaseModule,
        GameModule,
        OrganizationModule,
        EloConnectorModule,
        FranchiseModule,
        RedisModule,
        EventsModule,
        NotificationModule,
        IdentityModule,
    ],
    providers: [
        EloConsumer,
    ],
})
export class EloModule {}
