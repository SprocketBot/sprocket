import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { Logger, LoggerErrorInterceptor, LoggerModule } from 'nestjs-pino';
import { RedisModule } from './redis';
import { DynamicModule, Type } from '@nestjs/common';
import { GuidModule } from './guid/guid.module';

export const SprocketConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  expandVariables: true,
  load: [
    () => {
      dotenv.config();
      const configFile = env(
        readFileSync(process.env.CFG_FILE ?? './config.yaml', 'utf-8'),
      );
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
      quietReqLogger: process.env.PROD ? false : true,
      hooks: {
        logMethod(args, fn) {
          // This function is responsible for merging any contextual objects that are passed in log methods
          // e.g. this call does not get passed through properly
          // this.logger.log("Message!", { key: "some helpful context value" })

          const [ctx, msg, ...rest]: [any, string, ...any[]] = args as [
            any,
            string,
            ...any[],
          ];
          for (const r of rest) {
            if (typeof r === 'object') {
              Object.assign(ctx, r);
            } else {
              if (!Array.isArray(ctx.extra)) ctx.extra = [];
              ctx.extra.push(r);
            }
          }
          fn.bind(this)(ctx, msg);
        },
      },
      autoLogging: false,
      level:
        process.env.LOG_LEVEL?.toLowerCase() === 'debug' ? 'trace' : 'info',
      transport: process.env.PROD
        ? undefined // disable pretty logs while running on production
        : {
            targets: [
              {
                target: 'pino-pretty',
                level: 'trace',
                options: {
                  colorize: true,
                  hideObject: false,
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
export { Logger as PinoLogger, LoggerErrorInterceptor };
