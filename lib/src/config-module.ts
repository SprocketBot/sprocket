import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from './redis';
import { DynamicModule, Type } from '@nestjs/common';

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
];

export { ConfigService as SprocketConfigService };
