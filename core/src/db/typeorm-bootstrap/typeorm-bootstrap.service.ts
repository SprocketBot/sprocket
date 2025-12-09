import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SprocketConfigService } from '@sprocketbot/lib';

@Injectable()
export class TypeormBootstrapService {
  constructor(private readonly cfg: SprocketConfigService) { }

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
      cache: false,
      migrationsTableName: 'public.migrations',
      applicationName: 'SprocketCore',
    };
  }
}
