import {Module} from "@nestjs/common";

import {PopulateService} from "./populate/populate.service";

@Module({
    providers: [PopulateService],
    exports: [PopulateService],
})
export class UtilModule {}
