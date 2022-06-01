import {Module} from "@nestjs/common";

import {MatchValidationService} from "./match-validation/match-validation.service";
import {ScrimValidationService} from "./scrim-validation/scrim-validation.service";
import {ValidationController} from "./validation.controller";
import {ValidationService} from "./validation.service";

@Module({
    providers: [ScrimValidationService, MatchValidationService, ValidationService],
    exports: [ValidationService],
    controllers: [ValidationController],
})
export class ValidationModule {}
