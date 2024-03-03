import {Module} from "@nestjs/common";

import {CommandManagerService} from "./command-manager.service";

@Module({
    providers: [CommandManagerService],
    exports: [CommandManagerService],
})
export class CommandsModule {}
