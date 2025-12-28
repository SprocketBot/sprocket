import { Module } from '@nestjs/common';
import { MatchmakingModule } from '../matchmaking.module';
import { ScrimService } from '../scrim/scrim.service';

@Module({
  imports: [MatchmakingModule],
  exports: [MatchmakingModule],
})
export class MatchmakingConnectorModule { }

export { ScrimService as MatchmakingService };
export * from './schemas';
export { MatchmakingEvents, ScrimState } from '../constants';
