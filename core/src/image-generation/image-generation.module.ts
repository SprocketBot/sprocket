import { Module } from '@nestjs/common';
import { ImageGenerationModule as IGModule } from '@sprocketbot/common';

import { DatabaseModule } from '../database';
import { ImageGenerationController } from './image-generation.controller';
import { ImageGenerationResolver } from './image-generation.resolver';
import { ImageGenerationService } from './image-generation.service';

@Module({
  imports: [DatabaseModule, IGModule],
  providers: [ImageGenerationService, ImageGenerationResolver],
  exports: [ImageGenerationService],
  controllers: [ImageGenerationController],
})
export class ImageGenerationModule {}
