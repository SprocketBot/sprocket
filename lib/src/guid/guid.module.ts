import { Module } from '@nestjs/common';
import { GuidService } from './guid.service';

@Module({
  providers: [GuidService],
  exports: [GuidService],
})
export class GuidModule {}
