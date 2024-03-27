import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { default as cookieParser } from 'cookie-parser';
import * as cookieParserAlt from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from '@sprocketbot/lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: Boolean(process.env.PROD),
  });
  const log = app.get(Logger);
  // TODO: figure out how to use useLevelLabels to true so that we can actual statuses instead of arbitrary numbers

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.enableCors({
    credentials: true,
    origin: new URL(
      `${process.env.SSL.toLowerCase() === 'true' ? 'https' : 'http'}://${process.env.BASE_URL}:${process.env.LISTEN_PORT}`,
    ).origin,
  });
  console.log(
    new URL(
      `${process.env.SSL.toLowerCase() === 'true' ? 'https' : 'http'}://${process.env.BASE_URL}:${process.env.LISTEN_PORT}`,
    ).origin,
  );

  app.useLogger(log);

  log.fatal('fatal log');
  log.error('error log');
  log.warn('warn log');
  log.log('log log');
  log.debug('debug log');
  log.verbose('verbose log');

  if (typeof cookieParser === 'function') app.use(cookieParser());
  else app.use(cookieParserAlt());
  await app.listen(3000);
}

bootstrap();
