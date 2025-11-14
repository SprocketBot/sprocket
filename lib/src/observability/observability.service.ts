import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LogsEntity, LogLevel, LogsRepository, MetricsEntity, MetricType, MetricsRepository } from './observability.providers';

export interface LogEntry {
    timestamp?: Date;
    level: LogLevel;
    message: string;
    context?: string;
    service: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    error?: string;
    trace?: string;
    userId?: string;
    requestId?: string;
    traceId?: string;
    spanId?: string;
    tags?: Record<string, any>;
}

export interface MetricEntry {
    timestamp?: Date;
    name: string;
    value: number;
    type: MetricType;
    unit?: string;
    service: string;
    method?: string;
    path?: string;
    labels?: Record<string, string>;
    userId?: string;
    requestId?: string;
    traceId?: string;
    spanId?: string;
}

@Injectable()
export class ObservabilityService implements OnModuleInit {
    private readonly logger = new Logger(ObservabilityService.name);

    constructor(
        @Inject('LOGS_REPOSITORY') private readonly logsRepository?: LogsRepository,
        @Inject('METRICS_REPOSITORY') private readonly metricsRepository?: MetricsRepository
    ) { }

    async onModuleInit() {
        this.logger.log('ObservabilityService initialized');
    }

    async log(entry: LogEntry): Promise<void> {
        try {
            const logEntry: Partial<LogsEntity> = {
                timestamp: entry.timestamp || new Date(),
                level: entry.level,
                message: entry.message,
                context: entry.context,
                service: entry.service,
                method: entry.method,
                path: entry.path,
                statusCode: entry.statusCode,
                duration: entry.duration,
                error: entry.error,
                trace: entry.trace,
                userId: entry.userId,
                requestId: entry.requestId,
                traceId: entry.traceId,
                spanId: entry.spanId,
                tags: entry.tags,
            };

            if (this.logsRepository) {
                await this.logsRepository.save(logEntry);
            } else {
                // Fallback to console logging if repository is not available
                this.logger.log(`[${entry.level.toUpperCase()}] ${entry.service}: ${entry.message}`);
            }
        } catch (error) {
            this.logger.error(`Failed to save log entry: ${error.message}`);
        }
    }

    async recordMetric(entry: MetricEntry): Promise<void> {
        try {
            const metricEntry: Partial<MetricsEntity> = {
                timestamp: entry.timestamp || new Date(),
                name: entry.name,
                value: entry.value,
                type: entry.type,
                unit: entry.unit,
                service: entry.service,
                method: entry.method,
                path: entry.path,
                labels: entry.labels,
                userId: entry.userId,
                requestId: entry.requestId,
                traceId: entry.traceId,
                spanId: entry.spanId,
            };

            if (this.metricsRepository) {
                await this.metricsRepository.save(metricEntry);
            } else {
                // Fallback to debug logging if repository is not available
                this.logger.debug(`Metric: ${entry.name}=${entry.value} (${entry.type})`);
            }
        } catch (error) {
            this.logger.error(`Failed to save metric: ${error.message}`);
        }
    }

    async info(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
        await this.log({
            level: LogLevel.INFO,
            message,
            context,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): Promise<void> {
        await this.log({
            level: LogLevel.ERROR,
            message,
            context,
            error: error?.message,
            trace: error?.stack,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async warn(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
        await this.log({
            level: LogLevel.WARN,
            message,
            context,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async debug(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
        await this.log({
            level: LogLevel.DEBUG,
            message,
            context,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async trace(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
        await this.log({
            level: LogLevel.TRACE,
            message,
            context,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async incrementCounter(
        name: string,
        value = 1,
        labels?: Record<string, string>,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.recordMetric({
            name,
            value,
            type: MetricType.COUNTER,
            labels,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async recordGauge(
        name: string,
        value: number,
        labels?: Record<string, string>,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.recordMetric({
            name,
            value,
            type: MetricType.GAUGE,
            labels,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async recordHistogram(
        name: string,
        value: number,
        labels?: Record<string, string>,
        unit = 'seconds',
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.recordMetric({
            name,
            value,
            type: MetricType.HISTOGRAM,
            unit,
            labels,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    async recordSummary(
        name: string,
        value: number,
        labels?: Record<string, string>,
        unit = 'seconds',
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.recordMetric({
            name,
            value,
            type: MetricType.SUMMARY,
            unit,
            labels,
            service: metadata?.service || 'unknown',
            ...metadata,
        });
    }

    generateTraceId(): string {
        return randomUUID();
    }

    generateSpanId(): string {
        return randomUUID();
    }

    generateRequestId(): string {
        return randomUUID();
    }
}