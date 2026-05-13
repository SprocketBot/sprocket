import {Module} from "@nestjs/common";
import {EventsModule, PostgresModule} from "@sprocketbot/common";

import {HealthController} from "./health.controller";
import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [EventsModule, ScrimModule, PostgresModule],
    controllers: [HealthController],
})
export class AppModule {}
