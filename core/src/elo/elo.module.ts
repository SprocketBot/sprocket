import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameModule} from "../game";
import {OrganizationModule} from "../organization";
import {EloConsumer} from "./elo.consumer";
import {EloResolver} from "./elo.resolver";
import {EloService} from "./elo.service";
import {EloConnectorModule} from "./elo-connector/elo-connector.module";

@Module({
    imports: [
        BullModule.registerQueue({name: "elo"}),
        DatabaseModule,
        GameModule,
        OrganizationModule,
        EloConnectorModule,
    ],
    providers: [
        EloService,
        EloConsumer,
        EloResolver,
    ],
    exports: [
        EloService,
    ],
})
export class EloModule {}
