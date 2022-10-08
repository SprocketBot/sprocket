import {Controller, Logger} from "@nestjs/common";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {
    ImageGenerationEndpoint,
    ImageGenerationSchemas,
} from "@sprocketbot/common";

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
        );
    }

    // This is currently still needed for the frontend because of context
    @MessagePattern(`media-gen.img.create`)
    async createImage(@Ctx() context: RmqContext): Promise<boolean> {
        const message = context.getMessage() as {content: string};
        const rawData = JSON.parse(message.content.toString())
            .message as unknown;
        // Const data = CreateImageSchema.parse(rawData);
        const data = ImageGenerationSchemas.GenerateImage.input.parse(rawData);
        try {
            await this.imageGenerationService.processSvg(
                data.inputFile,
                data.outputFile,
                data.template,
            );
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }
}
