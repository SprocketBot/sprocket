import {Module} from "@nestjs/common";

import {EpicService} from "./epic/epic.service";

@Module({
    providers: [EpicService],
    exports: [EpicService],
})
export class ExternalModule {}
