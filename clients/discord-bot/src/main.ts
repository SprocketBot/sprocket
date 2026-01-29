import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AllExceptionsFilter, config } from '@sprocketbot/common';
import fetch from 'node-fetch';

import { AppModule } from './app.module';

// eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-assignment
global.fetch = fetch as any;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    logger: config.logger.levels,
    options: {
      urls: [config.transport.url],
      queue: config.transport.bot_queue,
      queueOptions: {
        durable: true,
      },
      heartbeat: 120,
    },
  });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen();
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
