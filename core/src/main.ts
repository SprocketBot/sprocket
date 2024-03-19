import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from '@sprocketbot/lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const log = app.get(Logger);
  // TODO: figure out how to use useLevelLabels to true so that we can actual statuses instead of arbitrary numbers

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.enableCors({
    credentials: true,
    origin: new URL(
      `${process.env.SSL.toLowerCase() === 'true' ? 'https' : 'http'}://${process.env.BASE_URL}:${process.env.LISTEN_PORT}`,
    ).origin,
  });

  app.useLogger(log);

  log.fatal('fatal log');
  log.error('error log');
  log.warn('warn log');
  log.log('log log');
  log.debug('debug log');
  log.verbose('verbose log');

  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
