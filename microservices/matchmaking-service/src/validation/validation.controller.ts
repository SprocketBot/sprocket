import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {MatchmakingEndpoint, MatchmakingSchemas} from "@sprocketbot/common";

import {ValidationService} from ".";

@Controller("validation")
export class ValidationController {
    constructor(private readonly validationService: ValidationService) {}

    @MessagePattern(MatchmakingEndpoint.ValidateReplays)
    async validate(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.ValidateReplays.input.parse(payload);
        return this.validationService.validate(data.submissionId);
    }
}
