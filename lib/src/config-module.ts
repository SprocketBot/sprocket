import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { Logger, LoggerErrorInterceptor, LoggerModule } from 'nestjs-pino';
import { RedisModule } from './redis';
import { DynamicModule, Type } from '@nestjs/common';
import { GuidModule } from './guid/guid.module';

const SprocketConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  expandVariables: true,
  load: [
    () => {
      dotenv.config();
      const configFile = env(readFileSync('./config.yaml', 'utf-8'));
      const config = yamlParse(configFile);
      const protocol = config.secure ? 'https' : 'http';
      return {
        ...config,
        protocol,
      };
    },
  ],
});

export const BaseSprocketModules: (DynamicModule | Type<any>)[] = [
  SprocketConfigModule,
  LoggerModule.forRoot({
    pinoHttp: {
      level:
        process.env.LOG_LEVEL?.toLowerCase() === 'debug' ? 'trace' : 'info',
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'trace',
            options: {
              colorize: true,
              hideObject: true,
            },
          },
        ],
      },
    },
  }),
  RedisModule,
  GuidModule,
];

export { ConfigService as SprocketConfigService };
export { Logger, LoggerErrorInterceptor };
