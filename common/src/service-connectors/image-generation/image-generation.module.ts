import { Module } from '@nestjs/common';

import { GlobalModule } from '../../global.module';
import { ImageGenerationService } from './image-generation.service';

@Module({
  providers: [ImageGenerationService],
  exports: [ImageGenerationService],
  imports: [GlobalModule],
})
export class ImageGenerationModule {}
