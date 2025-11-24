import { Module } from '@nestjs/common';
import { ScrimService } from '../scrim/scrim.service';

@Module({
  providers: [ScrimService],
  exports: [ScrimService],
})
export class MatchmakingConnectorModule { }

export { ScrimService as MatchmakingService };
export * from './schemas';
export { MatchmakingEvents, ScrimState } from '../constants';
