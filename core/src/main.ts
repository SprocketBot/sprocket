import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { default as cookieParser } from 'cookie-parser';
import * as cookieParserAlt from 'cookie-parser';
import { PinoLogger, LoggerErrorInterceptor } from '@sprocketbot/lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: Boolean(process.env.PROD && !process.env.LOGS_NO_BUFFER),
  });
  const log = app.get(PinoLogger);
  app.useLogger(log);
  log.fatal('fatal log');
  log.error('error log');
  log.warn('warn log');
  log.log('log log');
  log.debug('debug log');
  log.verbose('verbose log');

  // TODO: figure out how to use useLevelLabels to true so that we can actual statuses instead of arbitrary numbers

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const corsOrigin = new URL(`http://` + process.env.BASE_URL);
  if (process.env.SSL?.toLowerCase() === 'true') corsOrigin.protocol = 'https';
  corsOrigin.port = process.env.LISTEN_PORT;

  const allowedOrigins = [corsOrigin.origin];
  // Allow localhost on default port 80 (Traefik)
  if (process.env.BASE_URL === 'localhost' && corsOrigin.port !== '80') {
    allowedOrigins.push('http://localhost');
  }
  // Allow dev server
  allowedOrigins.push('http://localhost:5173');

  app.enableCors({
    credentials: true,
    origin: allowedOrigins,
  });
  log.log(`CORS enabled for ${allowedOrigins.join(', ')}`);

  if (typeof cookieParser === 'function') app.use(cookieParser());
  else app.use(cookieParserAlt());
  await Promise.race([
    app.listen(3000),
    new Promise((_, rej) =>
      setTimeout(
        () => rej(new Error('Timed out while trying to start nest app')),
        30 * 1000,
      ),
    ),
  ])
    .then(() => {
      log.log('Listening on port 3000');
    })
    .catch((e) => {
      log.error(e);

      process.exit(1);
    });
}

bootstrap();
