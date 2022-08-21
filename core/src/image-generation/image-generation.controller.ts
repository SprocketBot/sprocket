import {
    Controller, Get, Logger, Param,
} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {CoreEndpoint, CoreSchemas} from "@sprocketbot/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller("image-gen")
export class ImageGenerationController {
    private readonly logger = new Logger(ImageGenerationController.name);

    constructor(private imageGenerationService: ImageGenerationService) { }

    // @Get(":scrim_id")
    // async run(@Param() params: {scrim_id: number;}): Promise<string> {
    //     this.logger.debug({params});
    //     return this.imageGenerationService.createScrimReportCard(params.scrim_id);
    // }

    @MessagePattern(CoreEndpoint.GenerateReportCard)
    async generateReportCard(@Payload() payload: unknown): Promise<string> {
        const data = CoreSchemas.GenerateReportCard.input.parse(payload);
        return this.imageGenerationService.createScrimReportCard(data.mleScrimId);
    }
}
