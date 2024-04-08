import { Module } from '@nestjs/common';
import { RmqService } from './rmq.service';
import { SprocketConfigModule } from '../config-module';
import { GuidModule } from '../guid/guid.module';

@Module({
  imports: [SprocketConfigModule, GuidModule],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {}
