import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: `${process.env.SSL.toLowerCase() === 'true' ? 'https' : 'http'}://${process.env.BASE_URL}:${process.env.LISTEN_PORT}`,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
