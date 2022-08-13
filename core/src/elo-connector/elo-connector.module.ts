import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {GameModule} from "../game";
import {OrganizationModule} from "../organization";
import {EloConsumer} from "./elo-connector.consumer";
import {EloConnectorController} from "./elo-connector.controller";
import {EloConnectorService} from "./elo-connector.service";

@Module({
    imports: [
        BullModule.registerQueue({name: "elo"}),
        DatabaseModule,
        GameModule,
        OrganizationModule,
    ],
    providers: [
        EloConnectorService,
        EloConsumer,
    ],
    exports: [EloConnectorService],
    controllers: [EloConnectorController],
})
export class EloConnectorModule { }
