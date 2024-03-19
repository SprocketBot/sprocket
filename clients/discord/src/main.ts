import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, LoggerErrorInterceptor } from '@sprocketbot/lib';
import { DiscordQueue, DiscordQueueOptions } from './constants';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      bufferLogs: true,
      transport: Transport.RMQ,
      options: {
        urls: [process.env.AMQP_URL],
        queue: DiscordQueue.toString(),
        queueOptions: DiscordQueueOptions,
      },
    },
  );
  const log = app.get(Logger);
  app.useLogger(log);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen();
}

bootstrap();
