import { Module } from '@nestjs/common';
import { MledbService } from './mledb/mledb.service';

@Module({
  providers: [MledbService]
})
export class MledbModule {}
