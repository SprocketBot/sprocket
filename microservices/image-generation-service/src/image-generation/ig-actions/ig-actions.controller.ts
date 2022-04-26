import {
    Controller, Logger,
} from "@nestjs/common";
import {
    Ctx, MessagePattern, RmqContext,
} from "@nestjs/microservices";

import {ImageGenerationService} from "../image-generation.service";
import {CreateImageSchema} from "./types";

@Controller("ig-actions")
export class IgActionsController {
    private logger = new Logger(IgActionsController.name);
    
    constructor(private igService: ImageGenerationService) {}

    @MessagePattern(`media-gen.img.create`)
    async createImage(@Ctx() context: RmqContext): Promise<boolean> {
        // eslint-disable-next-line
        let rawData = JSON.parse(context.getMessage().content).message;
        const data = CreateImageSchema.parse(rawData);
        try {
            await this.igService.processSvg(data.inputFile, data.outputFile, data.filterValues);
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }
}
