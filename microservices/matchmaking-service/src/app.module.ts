import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [
        EventsModule,
        ScrimModule,
        RedisModule,
    ],
})
export class AppModule {}
