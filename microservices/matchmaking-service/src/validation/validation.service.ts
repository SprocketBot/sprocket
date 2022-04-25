import {Injectable} from "@nestjs/common";

import {MatchValidationService} from "./match-validation/match-validation.service";
import {ScrimValidationService} from "./scrim-validation/scrim-validation.service";

@Injectable()
export class ValidationService {
    constructor(
        private readonly matchValidationService: MatchValidationService,
        private readonly scrimValidationService: ScrimValidationService,
    ) {}

    async validate(submissionId: string): Promise<boolean> {
        return true;


    }
}
