import {Controller, Logger} from "@nestjs/common";
import {
    MessagePattern, Payload,
} from "@nestjs/microservices";
import {ImageGenerationEndpoint, ImageGenerationSchemas} from "@sprocketbot/common";

import {ImageGenerationService} from "./image-generation.service";

@Controller(ImageGenerationEndpoint.GenerateImage)
export class ImageGenerationController {
    private logger = new Logger(ImageGenerationController.name);

    constructor(private imageGenerationService: ImageGenerationService) {}

    @MessagePattern(ImageGenerationEndpoint.GenerateImage)
    async generateImage(@Payload() payload: unknown): Promise<string> {
        const data = ImageGenerationSchemas.GenerateImage.input.parse(payload);
        this.logger.debug("Input data successfully parsed");
        return this.imageGenerationService.processSvg(
            data.inputFile,
            data.outputFile,
            data.template,
            data.publicRead,
        );
    }

    // This is currently still needed for the frontend because of context
    @MessagePattern(`media-gen.img.create`)
    async createImage(@Payload() rawData: unknown): Promise<boolean> {
        // Const data = CreateImageSchema.parse(rawData);
        const data = ImageGenerationSchemas.GenerateImage.input.parse(rawData);
        try {
            await this.imageGenerationService.processSvg(
                data.inputFile,
                data.outputFile,
                data.template,
                data.publicRead,
            );
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }
}
