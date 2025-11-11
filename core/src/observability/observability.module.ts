import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityModule as LibObservabilityModule } from '@sprocketbot/lib';
import { LogsEntity, MetricsEntity, LogsRepository, MetricsRepository } from '../db/internal';
import { TestObservabilityController } from './test-observability.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LogsEntity,
            MetricsEntity
        ]),
        LibObservabilityModule.forRootAsync({
            useFactory: (logsRepository: LogsRepository, metricsRepository: MetricsRepository) => ({
                serviceName: 'sprocket-core',
                logsRepository,
                metricsRepository,
                interceptorOptions: {
                    serviceName: 'sprocket-core',
                    logRequests: true,
                    logResponses: true,
                    logErrors: true,
                    trackMetrics: true,
                    excludePaths: ['/health', '/metrics', '/favicon.ico', '/graphql'],
                }
            }),
            inject: [LogsRepository, MetricsRepository]
        })
    ],
    providers: [
        LogsRepository,
        MetricsRepository
    ],
    controllers: [
        TestObservabilityController
    ],
    exports: [
        LogsRepository,
        MetricsRepository,
        LibObservabilityModule
    ]
})
export class ObservabilityModule { }