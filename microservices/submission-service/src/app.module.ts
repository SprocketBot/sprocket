import {Module} from "@nestjs/common";
import {EventsModule, RedisModule} from "@sprocketbot/common";

@Module({
    controllers: [],
    imports: [EventsModule, RedisModule],
})
export class AppModule {
}
