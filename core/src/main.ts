import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { LogLevel } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const log = app.get(Logger);
  app.useLogger(log);
  // TODO: figure out how to use useLevelLabels to true so that we can actual statuses instead of arbitrary numbers

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.enableCors({
    credentials: true,
    origin: new URL(
      `${process.env.SSL.toLowerCase() === 'true' ? 'https' : 'http'}://${process.env.BASE_URL}:${process.env.LISTEN_PORT}`,
    ).origin,
  });

  const logLevels: LogLevel[] = [];

  switch (process.env.LOG_LEVEL?.toLowerCase()) {
    case 'debug':
      logLevels.push('warn', 'log', 'error', 'fatal', 'debug', 'verbose');
      break;
    default:
      logLevels.push('warn', 'log', 'error', 'fatal');
      break;
  }

  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
