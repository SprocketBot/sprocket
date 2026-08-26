import {Module} from "@nestjs/common";

import {CeleryService} from "./celery.service";

@Module({
    providers: [CeleryService],
    exports: [CeleryService],
})
export class CeleryModule {}
