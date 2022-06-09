import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

import {ReplayUploadModule} from "./replay-upload/replay-upload.module";

@Module({
    controllers: [],
    imports: [EventsModule, RedisModule, ReplayUploadModule],
})
export class AppModule {
}
