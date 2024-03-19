import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

export const MatchmakingQueue = 'sprocket-matchmaking';
export const MatchmakingQueueOptions: AmqplibQueueOptions = {
  durable: true,
};

export enum MatchmakingEndpoint {
  test = 'test',
  CreateScrim = 'CreateScrim',
}
