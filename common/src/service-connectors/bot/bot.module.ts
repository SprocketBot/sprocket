import { Inject, Module } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { GlobalModule } from '../../global.module';
import { CommonClient } from '../../global.types';
import { BotService } from './bot.service';

@Module({
  imports: [GlobalModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {
  constructor(@Inject(CommonClient.Bot) private botClient: ClientProxy) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.botClient.connect();
  }
}
