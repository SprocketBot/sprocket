import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CoreEndpoint, CoreSchemas, GenerateReportCardType } from '@sprocketbot/common';

import { ImageGenerationService } from './image-generation.service';

@Controller('image-gen')
export class ImageGenerationController {
  constructor(private imageGenerationService: ImageGenerationService) {}

  @MessagePattern(CoreEndpoint.GenerateReportCard)
  async generateReportCard(@Payload() payload: unknown): Promise<string> {
    const data = CoreSchemas.GenerateReportCard.input.parse(payload);

    if (data.type === GenerateReportCardType.SERIES) {
      return this.imageGenerationService.createSeriesReportCard(data.mleSeriesId);
    }

    return this.imageGenerationService.createScrimReportCard(data.mleScrimId);
  }
}
