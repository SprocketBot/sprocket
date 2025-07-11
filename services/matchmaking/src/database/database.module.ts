import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Scrim } from './entities/scrim.entity';
import { Participant } from './entities/participant.entity';
import { ScrimRepository } from './repositories/scrim.repository';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', 'postgres'),
            database: configService.get<string>(
              'DB_NAME',
              'sprocket_matchmaking',
            ),
            entities: [Scrim, Participant],
            synchronize:
              configService.get<string>('DB_SYNC', 'false') === 'true',
            logging:
              configService.get<string>('DB_LOGGING', 'false') === 'true',
          }),
        }),
        TypeOrmModule.forFeature([Scrim, Participant]),
      ],
      providers: [ScrimRepository],
      exports: [TypeOrmModule, ScrimRepository],
    };
  }

  static forFeature(entities: any[] = []) {
    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forFeature([...entities, Scrim, Participant])],
      providers: [ScrimRepository],
      exports: [ScrimRepository],
    };
  }
}
