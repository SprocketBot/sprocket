import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {
    CoreEndpoint,
    CoreSchemas,
    type CoreOutput,
} from "@sprocketbot/common";

import {ReportCardService} from "./report-card.service";

@Controller()
export class ReportCardController {
    constructor(private readonly reportCardService: ReportCardService) {}

    @MessagePattern(CoreEndpoint.UpsertReportCardAsset)
    async upsertReportCardAsset(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.UpsertReportCardAsset>> {
        const data = CoreSchemas.UpsertReportCardAsset.input.parse(payload);
        const success = await this.reportCardService.upsertAsset(data);
        return {success};
    }
}
