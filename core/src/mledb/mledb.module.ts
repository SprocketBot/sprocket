import { Module } from '@nestjs/common';
import { MledbUserService } from './mledb-user/mledb-user.service';

@Module({
  providers: [MledbUserService]
})
export class MledbModule {}
