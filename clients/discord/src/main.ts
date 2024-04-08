import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PinoLogger, LoggerErrorInterceptor } from '@sprocketbot/lib';
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
  const log = app.get(PinoLogger);
  app.useLogger(log);
  log.fatal('fatal log');
  log.error('error log');
  log.warn('warn log');
  log.log('log log');
  log.debug('debug log');
  log.verbose('verbose log');
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen();
}

bootstrap();
