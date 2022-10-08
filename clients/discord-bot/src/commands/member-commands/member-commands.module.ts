import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {DiscordModule} from "../../discord/discord.module";
import {EmbedModule} from "../../embed/embed.module";
import {CommandsModule} from "../../marshal";
import {NotificationsModule} from "../../notifications";
import {HelpMarshal} from "./help";
import {ReportCardMarshal} from "./report-card.marshal";

@Module({
    imports: [
        DiscordModule,
        CommandsModule,
        CoreModule,
        EmbedModule,
        NotificationsModule,
    ],
    providers: [HelpMarshal, ReportCardMarshal],
})
export class MemberCommandsModule {}
