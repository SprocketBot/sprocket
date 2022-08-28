import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {RedisModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {OrganizationModule} from "../organization";
import {EloConsumer} from "./elo.consumer";
import {EloService} from "./elo.service";
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
    ],
    providers: [
        EloService,
        EloConsumer,
    ],
    exports: [
        EloService,
    ],
})
export class EloModule {}
