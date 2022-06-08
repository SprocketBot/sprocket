import {Module} from "@nestjs/common";
import {
    BotModule, CoreModule, EventsModule,
} from "@sprocketbot/common";

import {MemberEventSubscriber} from "./member.event-subscriber";
import {MemberService} from "./member.service";

@Module({
    imports: [
        EventsModule,
        BotModule,
        CoreModule,
    ],
    providers: [MemberService, MemberEventSubscriber],
})
export class MemberModule {}
