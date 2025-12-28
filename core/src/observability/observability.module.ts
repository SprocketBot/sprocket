import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservabilityModule as LibObservabilityModule } from '@sprocketbot/lib';
import { LogsEntity } from '../db/observability/logs.entity';
import { MetricsEntity } from '../db/observability/metrics.entity';
import { LogsRepository } from '../db/observability/logs.repository';
import { MetricsRepository } from '../db/observability/metrics.repository';
import { TestObservabilityController } from './test-observability.controller';

import { DbModule } from '../db/db.module';

@Module({
    imports: [
        DbModule, // Import DbModule directly
        LibObservabilityModule.forRootAsync({
            imports: [DbModule],
            useFactory: () => ({
                serviceName: 'sprocket-core',
                logsRepository: null,
                metricsRepository: null,
                interceptorOptions: {
                    serviceName: 'sprocket-core',
                    logRequests: true,
                    logResponses: true,
                    logErrors: true,
                    trackMetrics: true,
                    excludePaths: ['/health', '/metrics', '/favicon.ico', '/graphql'],
                }
            }),
            inject: []
        })
    ],

    providers: [
        // Repositories provided by DbModule
    ],
    controllers: [
        TestObservabilityController
    ],
    exports: [
        LibObservabilityModule
    ]
})
export class ObservabilityModule { }