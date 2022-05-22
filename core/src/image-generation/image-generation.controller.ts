import {Controller, Get, Param} from "@nestjs/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller("image-gen")
export class ImageGenerationController {
    constructor(private imageGenerationService: ImageGenerationService) { }

    @Get(":scrim_id")
    async run(@Param() params): Promise<string> {
        console.log(params.scrim_id)
        return this.imageGenerationService.createScrimReportCard(params.scrim_id);
    }
}
