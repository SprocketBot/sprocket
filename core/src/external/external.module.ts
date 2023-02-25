import {Module} from "@nestjs/common";

import {EpicModule} from "./epic/epic.module";

@Module({
    imports: [EpicModule],
})
export class ExternalModule {}
