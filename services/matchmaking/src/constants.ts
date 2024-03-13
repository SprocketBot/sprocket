import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

export const MatchmakingQueue = 'sprocket-matchmaking';
export const MatchmakingResponseQueue = 'sprocket-matchmaking-reply';
export const MatchmakingQueueOptions: AmqplibQueueOptions = {
  durable: true,
};
