import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {EmbedModule} from "../embed/embed.module";
import {EmbedService} from "../embed/embed.service";
import {CommandsModule} from "./commands/commands.module";
import {EventsModule} from "./events/events.module";

@Module({
    imports: [EmbedModule, CoreModule, CommandsModule, EventsModule],
    providers: [EmbedService],
    exports: [EmbedService],
})
export class MarshalModule {}
