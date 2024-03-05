import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';

@Module({
  providers: [MatchmakingService]
})
export class MatchmakingModule {}
