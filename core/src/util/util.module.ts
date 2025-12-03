import {Module} from "@nestjs/common";

import type { DatabaseModule } from "../database/database.module";
import {PopulateService} from "./populate/populate.service";

@Module({
    imports: [DatabaseModule],
    providers: [PopulateService],
    exports: [PopulateService],
})
export class UtilModule {}
