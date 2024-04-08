import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SprocketConfigService } from '@sprocketbot/lib';

@Injectable()
export class TypeormBootstrapService {
  constructor(private readonly cfg: SprocketConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.cfg.getOrThrow('pg.host'),
      port: this.cfg.getOrThrow('pg.port'),
      username: this.cfg.getOrThrow('pg.username'),
      password: this.cfg.getOrThrow('pg.password'),
      database: this.cfg.getOrThrow('pg.database'),
      connectTimeoutMS: 2500,
      synchronize: false,
      autoLoadEntities: true,
      migrationsRun: false,
      cache:
        this.cfg.getOrThrow('pg.cache').toString().toLowerCase() === 'true'
          ? {
              type: 'ioredis',
              alwaysEnabled: true,
              options: {
                host: this.cfg.getOrThrow('redis.hostname'),
                port: this.cfg.getOrThrow('redis.port'),
                connectionName: 'typeorm-cache',
              },
              duration: 5000,
            }
          : undefined,
      migrationsTableName: 'public.migrations',
      applicationName: 'SprocketCore',
    };
  }
}
