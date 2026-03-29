import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {HealthController} from "./health.controller";
import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [EventsModule, ScrimModule, RedisModule],
    controllers: [HealthController],
})
export class AppModule {}
