import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SprocketConfigService } from '@sprocketbot/lib';
import { MatchmakingName } from './constants';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingQueue, MatchmakingQueueOptions } from '../constants';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: MatchmakingName,
          inject: [SprocketConfigService],
          useFactory(cfg: SprocketConfigService) {
            return {
              transport: Transport.RMQ,
              options: {
                urls: [cfg.getOrThrow<string>('amqp.url')],
                queue: MatchmakingQueue,
                queueOptions: MatchmakingQueueOptions,
              },
            };
          },
        },
      ],
    }),
  ],
  providers: [MatchmakingService],
  exports: [MatchmakingService],
})
export class MatchmakingConnectorModule {}

export { MatchmakingService };
export * from './schemas';
