import {Module} from "@nestjs/common";
import {GqlModule} from "@sprocketbot/common";

import {EmbedService} from "./embed.service";

@Module({
    imports: [GqlModule],
    providers: [EmbedService],
    exports: [EmbedService],
})
export class EmbedModule {}
