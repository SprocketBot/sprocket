import {Module} from "@nestjs/common";

import {ReplayValidationService} from "./replay-validation.service";

@Module({
    providers: [ReplayValidationService],
    exports: [ReplayValidationService],
})
export class ReplayValidationModule {}
