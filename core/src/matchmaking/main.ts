import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PinoLogger, LoggerErrorInterceptor } from '@sprocketbot/lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: Boolean(process.env.PROD),
  });
  const log = app.get(PinoLogger);
  app.useLogger(log);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen(3001); // Use a different port than the main core service
}

bootstrap();
