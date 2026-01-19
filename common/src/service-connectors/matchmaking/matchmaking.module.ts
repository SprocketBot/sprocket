import { Module } from '@nestjs/common';

import { GlobalModule } from '../../global.module';
import { MatchmakingService } from './matchmaking.service';

@Module({
  providers: [MatchmakingService],
  exports: [MatchmakingService],
  imports: [GlobalModule],
})
export class MatchmakingModule {}
