import {Module} from "@nestjs/common";

import {PostgresModule} from "../postgres";
import {CeleryService} from "./celery.service";

@Module({
    imports: [PostgresModule],
    providers: [CeleryService],
    exports: [CeleryService],
})
export class CeleryModule {}
