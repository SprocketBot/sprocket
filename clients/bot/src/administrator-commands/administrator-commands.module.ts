import {Module} from "@nestjs/common";
import {GqlModule} from "@sprocketbot/common";
import {EmbedModule} from "src/embed/embed.module";

import {MarshalModule} from "../marshal";
import {CommandDecoratorTestMarshal} from "./command-decorator-test.marshal";
import {DebugCommandsMarshal} from "./debug-commands.marshal";
import {MiscCommandsMarshal} from "./misc-commands.marshal";
import {SprocketConfigurationMarshal} from "./sprocket-configuration.marshal";
import {SprocketStatusMarshal} from "./sprocket-status.marshal";

@Module({
    imports: [
        MarshalModule,
        GqlModule,
        EmbedModule,
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
