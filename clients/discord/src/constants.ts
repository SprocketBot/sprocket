import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

export const DiscordQueue = 'sprocket-discord';
export const DiscordQueueOptions: AmqplibQueueOptions = {
  durable: true,
};

export enum DiscordEndpoint {}
