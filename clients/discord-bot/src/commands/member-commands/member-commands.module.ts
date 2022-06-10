import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {DiscordModule} from "../../discord/discord.module";
import {EmbedModule} from "../../embed/embed.module";
import {CommandsModule} from "../../marshal";
import {HelpMarshal} from "./help";
import {MemberLookupMarshal} from "./member-lookup.marshal";
import {OrganizationConfigurationMarshal} from "./organization-configuration.marshal";

@Module({
    imports: [
        DiscordModule,
        CommandsModule,
        CoreModule,
        EmbedModule,
    ],
    providers: [
        MemberLookupMarshal,
        OrganizationConfigurationMarshal,
        HelpMarshal,
    ],
})
export class MemberCommandsModule {}
