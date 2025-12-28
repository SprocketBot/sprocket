import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LogLevel, MetricType } from './observability.providers';
import type { LogsEntity, LogsRepository } from './observability.providers';
import { Meter, Counter, Histogram, ObservableGauge, UpDownCounter } from '@opentelemetry/api';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

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

    private meter: Meter;
    private counters: Map<string, Counter> = new Map();
    private histograms: Map<string, Histogram> = new Map();
    private gauges: Map<string, ObservableGauge> = new Map();
    private upDownCounters: Map<string, UpDownCounter> = new Map();

    constructor(
        @Inject('SERVICE_NAME') private readonly serviceName: string,
        @Inject('LOGS_REPOSITORY') private readonly logsRepository?: LogsRepository,
    ) {
        const exporter = new OTLPMetricExporter({
            url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://otel-collector:4317',
        });
        
        const metricReader = new PeriodicExportingMetricReader({
            exporter,
            exportIntervalMillis: 15000,
        });

        const myServiceResource = new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
        });

        const meterProvider = new MeterProvider({
            resource: myServiceResource,
            readers: [metricReader],
        });

        this.meter = meterProvider.getMeter(this.serviceName);
    }

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
        // Legacy support mapping to OTel
        const labels = entry.labels || {};
        const attributes = { 
            ...labels,
            service: entry.service,
            method: entry.method,
            path: entry.path
        };

        if (entry.type === MetricType.COUNTER) {
            this.getOrCreateCounter(entry.name).add(entry.value, attributes);
        } else if (entry.type === MetricType.HISTOGRAM || entry.type === MetricType.SUMMARY) {
            this.getOrCreateHistogram(entry.name).record(entry.value, attributes);
        } else if (entry.type === MetricType.GAUGE) {
             // Gauges are observableCallback based in OTel, handling ad-hoc recording is tricky.
             // For now we map to UpDownCounter which is the closest active equivalent or log mismatch
             this.getOrCreateUpDownCounter(entry.name).add(entry.value, attributes);
        }
    }

    private getOrCreateCounter(name: string): Counter {
        if (!this.counters.has(name)) {
            this.counters.set(name, this.meter.createCounter(name));
        }
        return this.counters.get(name)!;
    }

    private getOrCreateHistogram(name: string): Histogram {
        if (!this.histograms.has(name)) {
            this.histograms.set(name, this.meter.createHistogram(name));
        }
        return this.histograms.get(name)!;
    }

    private getOrCreateUpDownCounter(name: string): UpDownCounter {
        if (!this.upDownCounters.has(name)) {
            this.upDownCounters.set(name, this.meter.createUpDownCounter(name));
        }
        return this.upDownCounters.get(name)!;
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