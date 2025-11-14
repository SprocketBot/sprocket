import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ObservabilityService } from './observability.service';
import { ObservabilityInterceptor, ObservabilityOptions } from './observability.interceptor';
import { LogsRepository, MetricsRepository } from './observability.providers';

export interface ObservabilityModuleOptions {
    serviceName: string;
    logsRepository?: LogsRepository;
    metricsRepository?: MetricsRepository;
    interceptorOptions?: Partial<ObservabilityOptions>;
}

@Global()
@Module({})
export class ObservabilityModule {
    static forRoot(options: ObservabilityModuleOptions): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'OBSERVABILITY_OPTIONS',
                useValue: options,
            },
            {
                provide: 'SERVICE_NAME',
                useValue: options.serviceName,
            },
            ObservabilityService,
            {
                provide: 'LOGS_REPOSITORY',
                useValue: options.logsRepository || null,
            },
            {
                provide: 'METRICS_REPOSITORY',
                useValue: options.metricsRepository || null,
            },
        ];

        // Only provide the interceptor if serviceName is provided
        if (options.serviceName) {
            providers.push({
                provide: 'OBSERVABILITY_INTERCEPTOR',
                useFactory: (observabilityService: ObservabilityService) => {
                    return new ObservabilityInterceptor({
                        serviceName: options.serviceName,
                        ...options.interceptorOptions,
                    });
                },
                inject: [ObservabilityService],
            });
        }

        return {
            module: ObservabilityModule,
            providers,
            exports: [ObservabilityService, 'OBSERVABILITY_INTERCEPTOR'],
            global: true,
        };
    }

    static forRootAsync(options: {
        useFactory: (...args: any[]) => Promise<ObservabilityModuleOptions> | ObservabilityModuleOptions;
        inject?: any[];
    }): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'OBSERVABILITY_OPTIONS',
                useFactory: options.useFactory,
                inject: options.inject || [],
            },
            {
                provide: 'SERVICE_NAME',
                useFactory: (opts: ObservabilityModuleOptions) => opts.serviceName,
                inject: ['OBSERVABILITY_OPTIONS'],
            },
            ObservabilityService,
            {
                provide: 'LOGS_REPOSITORY',
                useFactory: (opts: ObservabilityModuleOptions) => opts.logsRepository || null,
                inject: ['OBSERVABILITY_OPTIONS'],
            },
            {
                provide: 'METRICS_REPOSITORY',
                useFactory: (opts: ObservabilityModuleOptions) => opts.metricsRepository || null,
                inject: ['OBSERVABILITY_OPTIONS'],
            },
        ];

        return {
            module: ObservabilityModule,
            providers,
            exports: [ObservabilityService],
            global: true,
        };
    }
}