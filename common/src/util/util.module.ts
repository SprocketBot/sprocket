import {Module} from "@nestjs/common";

import {NanoidService} from "./nanoid/nanoid.service";

@Module({
    providers: [NanoidService],
    exports: [NanoidService],
})
export class UtilModule {}
