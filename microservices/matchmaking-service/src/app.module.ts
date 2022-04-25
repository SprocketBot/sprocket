import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ScrimModule} from "./scrim/scrim.module";
import {ValidationModule} from "./validation/validation.module";

@Module({
    controllers: [],
    imports: [EventsModule, ScrimModule, RedisModule, ValidationModule],
})
export class AppModule {
}
