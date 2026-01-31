import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {PopulateService} from "./populate/populate.service";

@Module({
    imports: [DatabaseModule],
    providers: [PopulateService],
    exports: [PopulateService],
})
export class UtilModule {}
