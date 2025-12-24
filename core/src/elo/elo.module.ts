import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EloService } from './elo.service';
import { EloConnector } from './elo.connector';
import {
    EloRatingNodeEntity,
    GameRatingConfigEntity,
    MatchRatingCalculationEntity,
    EventQueue,
    LogsEntity,
    MetricsEntity,
    LogsRepository,
    MetricsRepository,
} from '../db/internal';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EloRatingNodeEntity,
            GameRatingConfigEntity,
            MatchRatingCalculationEntity,
            EventQueue,
            LogsEntity,
            MetricsEntity,
        ]),
    ],
    providers: [EloService, EloConnector, LogsRepository, MetricsRepository],
    exports: [EloService],
})
export class EloModule {}
