import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { RedLock } from '@sprocketbot/lib';
import { MatchmakingEndpoint } from './constants';
import { Scrim } from '@sprocketbot/lib/types';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MatchmakingEndpoint.test)
  @RedLock(['test-lock'])
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern(MatchmakingEndpoint.CreateScrim)
  @RedLock([(mem) => mem.memberId])
  async createScrim({ memberId }: { memberId: string }): Promise<Scrim> {
    this.logger.debug('Got createScrim request for ' + memberId);
    return {
      participants: [memberId],
      scrimId: '',
    };
  }
}
