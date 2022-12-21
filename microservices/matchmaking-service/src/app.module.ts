import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";
import { LoggerModule } from "nestjs-pino";

import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [EventsModule, ScrimModule, RedisModule, LoggerModule.forRoot()],
})
export class AppModule {}
