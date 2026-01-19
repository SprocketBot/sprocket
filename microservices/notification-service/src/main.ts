import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AllExceptionsFilter, config } from '@sprocketbot/common';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const rmqOptions: any = {
    urls: [config.transport.url],
    queue: config.transport.notification_queue,
    queueOptions: {
      durable: true,
    },
    heartbeat: 120,
  };

  // Add authentication if environment variables are provided
  const rmqUser = process.env.RABBITMQ_DEFAULT_USER;
  const rmqPass = process.env.RABBITMQ_DEFAULT_PASS;

  if (rmqUser && rmqPass) {
    rmqOptions.options = {
      credentials: {
        username: rmqUser,
        password: rmqPass,
      },
    };
  }

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: rmqOptions,
  });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen();
}

bootstrap().catch(e => {
  // eslint-disable-next-line no-console
  console.error(e);
  // eslint-disable-next-line no-undef
  process.exit(1);
});
