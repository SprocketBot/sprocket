import {
    Controller, Get, Logger, Param,
} from "@nestjs/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller("image-gen")
export class ImageGenerationController {
    private readonly logger = new Logger(ImageGenerationController.name);

    constructor(private imageGenerationService: ImageGenerationService) { }

    @Get(":scrim_id")
    async run(@Param() params: {scrim_id: number;}): Promise<string> {
        this.logger.debug({params});
        return this.imageGenerationService.createScrimReportCard(params.scrim_id);
    }
}
