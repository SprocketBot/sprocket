import {Controller} from "@nestjs/common";
import {MessagePattern} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {CoreEndpoint, CoreInput} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";

@Controller("scrim")
export class ScrimController {
    constructor(private readonly scrimService: ScrimService) {}

    @MessagePattern(CoreEndpoint.GetScrimReportCardWebhooks)
    async getScrimReportCardWebhooks(scrim: CoreInput<CoreEndpoint.GetScrimReportCardWebhooks>): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>> {
        return this.scrimService.getRelevantWebhooks(scrim);
    }
}
