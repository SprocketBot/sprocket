import {Controller, Get} from "@nestjs/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller("image-gen")
export class ImageGenerationController {
    constructor(private imageGenerationService: ImageGenerationService) { }

    @Get()
    async run(): Promise<string> {
        return this.imageGenerationService.createScrimReportCard(7);
    }
}
