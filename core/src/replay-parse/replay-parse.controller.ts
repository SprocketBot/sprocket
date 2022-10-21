import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {ReplayParseService} from "./replay-parse.service";

@Controller("replay-parse")
export class ReplayParseController {
    constructor(private readonly replayParseService: ReplayParseService) {}

    @MessagePattern(CoreEndpoint.VerifySubmissionUniqueness)
    async verifySubmissionUniqueness(@Payload() payload: unknown): Promise<boolean> {
        const data = CoreSchemas[CoreEndpoint.VerifySubmissionUniqueness].input.parse(payload);
        return this.replayParseService.verifySubmissionUniqueness(data);
    }
}
