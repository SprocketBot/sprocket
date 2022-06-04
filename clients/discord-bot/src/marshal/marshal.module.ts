import {Module} from "@nestjs/common";
import {CoreModule} from "@sprocketbot/common";

import {EmbedModule} from "../embed/embed.module";
import {EmbedService} from "../embed/embed.service";
import {CommandManagerService} from "./command-manager/command-manager.service";

@Module({
    imports: [EmbedModule, CoreModule],
    providers: [CommandManagerService, EmbedService],
    exports: [CommandManagerService, EmbedService],
})
export class MarshalModule {}
