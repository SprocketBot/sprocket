import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {EmbedModule} from "../../embed/embed.module";
import {CommandsModule, EventsModule} from "../../marshal";
import {CommandDecoratorTestMarshal} from "./command-decorator-test.marshal";
import {DebugCommandsMarshal} from "./debug-commands.marshal";
import {MiscCommandsMarshal} from "./misc-commands.marshal";
import {SprocketConfigurationMarshal} from "./sprocket-configuration.marshal";
import {SprocketStatusMarshal} from "./sprocket-status.marshal";

@Module({
    imports: [
        CommandsModule,
        EventsModule,
        EmbedModule,
        CoreModule,
    ],
    providers: [
        DebugCommandsMarshal,
        SprocketStatusMarshal,
        MiscCommandsMarshal,
        SprocketConfigurationMarshal,
        CommandDecoratorTestMarshal,
    ],
})
export class AdministratorCommandsModule {}
