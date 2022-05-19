import {
  Controller, Logger,
} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import {ImageGenerationService} from "./image-generation.service";
import {ImageGenerationEndpoint, ImageGenerationSchemas} from "@sprocketbot/common";

@Controller("image-gneration")
export class ImageGenerationController {
  private logger = new Logger(ImageGenerationController.name);
  
  constructor(private imageGenerationService: ImageGenerationService) {}

  @MessagePattern(ImageGenerationEndpoint.GenerateScrimReportCard)
  async createScrim(@Payload() payload: unknown): Promise<string> {
      const data = ImageGenerationSchemas.GenerateScrimReportCard.input.parse(payload);
      // TODO: Permissions Checks 
      return this.imageGenerationService.generateScrimReportCard(data.scrimId);
  }


  // @MessagePattern(`media-gen.img.create`)
  // async createImage(@Ctx() context: RmqContext): Promise<boolean> {
  //     // eslint-disable-next-line
  //     let rawData = JSON.parse(context.getMessage().content).message;
  //     const data = CreateImageSchema.parse(rawData);
  //     try {
  //         await this.igService.processSvg(data.inputFile, data.outputFile, data.filterValues);
  //         return true;
  //     } catch (err) {
  //         this.logger.error(err);
  //         return false;
  //     }
  // }
}
