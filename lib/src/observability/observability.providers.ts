// This file provides the interface for observability providers
// The actual implementations will be provided by the core service

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace'
}

export enum MetricType {
    COUNTER = 'counter',
    GAUGE = 'gauge',
    HISTOGRAM = 'histogram',
    SUMMARY = 'summary'
}

// Base entity interfaces
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updateAt: Date;
}

// Logs entity interface
export interface LogsEntity extends BaseEntity {
    timestamp: Date;
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

// Metrics entity interface
export interface MetricsEntity extends BaseEntity {
    timestamp: Date;
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

// Repository interfaces
export interface LogsRepository {
    save(entity: Partial<LogsEntity>): Promise<LogsEntity>;
    find(options?: any): Promise<LogsEntity[]>;
    findOne(options?: any): Promise<LogsEntity | null>;
    createQueryBuilder(): any;
}

export interface MetricsRepository {
    save(entity: Partial<MetricsEntity>): Promise<MetricsEntity>;
    find(options?: any): Promise<MetricsEntity[]>;
    findOne(options?: any): Promise<MetricsEntity | null>;
    createQueryBuilder(): any;
}