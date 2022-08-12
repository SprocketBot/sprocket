import {
    Controller, Get, Logger, Param,
} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {
    CoreEndpoint, CoreSchemas, GenerateReportCardType,
} from "@sprocketbot/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller("image-gen")
export class ImageGenerationController {
    private readonly logger = new Logger(ImageGenerationController.name);

    constructor(private imageGenerationService: ImageGenerationService) { }

    @Get("scrim/:scrim_id")
    async generateScrimReportCard(@Param() params: {scrim_id: number;}): Promise<string> {
        this.logger.debug({params});
        return this.imageGenerationService.createScrimReportCard(params.scrim_id);
    }

    @Get("series/:series_id")
    async generateMatchmReportCard(@Param() params: {series_id: number;}): Promise<string> {
        this.logger.debug({params});
        return this.imageGenerationService.createMatchReportCard(params.series_id);
    }

    @MessagePattern(CoreEndpoint.GenerateReportCard)
    async generateReportCard(@Payload() payload: unknown): Promise<string> {
        const data = CoreSchemas.GenerateReportCard.input.parse(payload);
        if (data.type === GenerateReportCardType.SERIES) {
            return this.imageGenerationService.createMatchReportCard(data.mleSeriesId);
        }
        return this.imageGenerationService.createScrimReportCard(data.mleScrimId);
        
    }
}
