import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {EloConnectorController} from "./elo-connector.controller";
import {EloConnectorService} from "./elo-connector.service";

@Module({
    imports: [
        BullModule.registerQueue({name: "elo"}),
        DatabaseModule,
    ],
    providers: [EloConnectorService],
    exports: [EloConnectorService],
    controllers: [EloConnectorController],
})
export class EloConnectorModule { }
