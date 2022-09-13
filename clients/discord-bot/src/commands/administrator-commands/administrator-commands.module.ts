import {Module} from "@nestjs/common";
import {CoreModule, EventsModule} from "@sprocketbot/common";

import {DiscordModule} from "../../discord/discord.module";
import {EmbedModule} from "../../embed/embed.module";
import {CommandsModule} from "../../marshal";
// import {CommandDecoratorTestMarshal} from "./command-decorator-test.marshal";
// import {DebugCommandsMarshal} from "./debug-commands.marshal";
import {DeveloperCommandsMarshal} from "./developer-commands.marshal";
// import {MiscCommandsMarshal} from "./misc-commands.marshal";
// import {SprocketConfigurationMarshal} from "./sprocket-configuration.marshal";
// import {SprocketStatusMarshal} from "./sprocket-status.marshal";

@Module({
    imports: [
        DiscordModule,
        CommandsModule,
        EmbedModule,
        CoreModule,
        EventsModule,
    ],
    providers: [
        // TODO scope by role before re-adding
        // DebugCommandsMarshal,
        // SprocketStatusMarshal,
        // MiscCommandsMarshal,
        // SprocketConfigurationMarshal,
        // CommandDecoratorTestMarshal,
        DeveloperCommandsMarshal,
    ],
})
export class AdministratorCommandsModule {}
