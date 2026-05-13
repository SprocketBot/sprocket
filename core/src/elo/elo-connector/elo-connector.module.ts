import {Module} from "@nestjs/common";
import {PostgresModule} from "@sprocketbot/common";

import {EloConnectorService} from "./elo-connector.service";

@Module({
    imports: [
        PostgresModule,
    ],
    providers: [EloConnectorService],
    exports: [EloConnectorService],
})
export class EloConnectorModule {}
