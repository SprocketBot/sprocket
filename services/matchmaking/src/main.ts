import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import {
  MatchmakingQueue,
  MatchmakingQueueOptions,
} from './constants';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      bufferLogs: true,
      transport: Transport.RMQ,
      options: {
        urls: [process.env.AMQP_URL],
        queue: MatchmakingQueue.toString(),
        queueOptions: MatchmakingQueueOptions,
      },
    },
  );
  const log = app.get(Logger);
  app.useLogger(log);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen();
}
bootstrap();
