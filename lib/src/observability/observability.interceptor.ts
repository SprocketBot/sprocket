import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

export interface ObservabilityOptions {
    serviceName?: string;
    logRequests?: boolean;
    logResponses?: boolean;
    logErrors?: boolean;
    trackMetrics?: boolean;
    excludePaths?: string[];
}

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ObservabilityInterceptor.name);

    constructor(
        private readonly options: ObservabilityOptions = {
            serviceName: 'unknown-service',
            logRequests: true,
            logResponses: true,
            logErrors: true,
            trackMetrics: true,
            excludePaths: ['/health', '/metrics', '/favicon.ico'],
        }
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Skip excluded paths
        if (this.shouldExcludePath(request.path)) {
            return next.handle();
        }

        const startTime = Date.now();
        const requestId = randomUUID();
        const traceId = request.headers['x-trace-id'] || randomUUID();
        const spanId = randomUUID();

        // Set trace context
        request.traceId = traceId;
        request.spanId = spanId;
        request.requestId = requestId;

        // Log incoming request
        if (this.options.logRequests) {
            this.logRequest(request, traceId, spanId);
        }

        return next.handle().pipe(
            tap((responseData) => {
                const duration = Date.now() - startTime;

                if (this.options.logResponses) {
                    this.logResponse(request, response, responseData, duration, traceId, spanId);
                }

                if (this.options.trackMetrics) {
                    this.recordMetrics(request, response, duration, traceId, spanId);
                }
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;

                if (this.options.logErrors) {
                    this.logError(request, error, duration, traceId, spanId);
                }

                if (this.options.trackMetrics) {
                    this.recordErrorMetrics(request, error, duration, traceId, spanId);
                }

                return throwError(() => error);
            })
        );
    }

    private shouldExcludePath(path: string): boolean {
        return this.options.excludePaths?.some(excludedPath =>
            path.startsWith(excludedPath)
        ) || false;
    }

    private logRequest(request: any, traceId: string, spanId: string): void {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Incoming request: ${request.method} ${request.path}`,
            context: 'HTTP',
            service: this.options.serviceName,
            method: request.method,
            path: request.path,
            userId: request.user?.id,
            requestId: request.requestId,
            traceId,
            spanId,
            tags: {
                userAgent: request.headers['user-agent'],
                ip: request.ip,
                query: request.query,
                body: this.sanitizeBody(request.body),
            }
        };

        this.logger.log(JSON.stringify(logData));
    }

    private logResponse(
        request: any,
        response: any,
        responseData: any,
        duration: number,
        traceId: string,
        spanId: string
    ): void {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Response: ${request.method} ${request.path} - ${response.statusCode}`,
            context: 'HTTP',
            service: this.options.serviceName,
            method: request.method,
            path: request.path,
            statusCode: response.statusCode,
            duration,
            userId: request.user?.id,
            requestId: request.requestId,
            traceId,
            spanId,
            tags: {
                responseSize: JSON.stringify(responseData).length,
            }
        };

        this.logger.log(JSON.stringify(logData));
    }

    private logError(
        request: any,
        error: any,
        duration: number,
        traceId: string,
        spanId: string
    ): void {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Error: ${request.method} ${request.path}`,
            context: 'HTTP',
            service: this.options.serviceName,
            method: request.method,
            path: request.path,
            statusCode: error.status || 500,
            duration,
            userId: request.user?.id,
            requestId: request.requestId,
            traceId,
            spanId,
            error: error.message,
            trace: error.stack,
            tags: {
                errorType: error.name,
                errorCode: error.code,
            }
        };

        this.logger.error(JSON.stringify(logData));
    }

    private recordMetrics(
        request: any,
        response: any,
        duration: number,
        traceId: string,
        spanId: string
    ): void {
        const timestamp = new Date();
        const baseMetric = {
            timestamp,
            service: this.options.serviceName!,
            method: request.method,
            path: request.path,
            userId: request.user?.id,
            requestId: request.requestId,
            traceId,
            spanId,
        };

        // Record request duration
        this.recordMetric({
            ...baseMetric,
            name: 'http_request_duration_seconds',
            value: duration / 1000, // Convert to seconds
            type: 'histogram',
            unit: 'seconds',
            labels: {
                method: request.method,
                status: response.statusCode.toString(),
                path: this.normalizePath(request.path),
            }
        });

        // Record request count
        this.recordMetric({
            ...baseMetric,
            name: 'http_requests_total',
            value: 1,
            type: 'counter',
            labels: {
                method: request.method,
                status: response.statusCode.toString(),
                path: this.normalizePath(request.path),
            }
        });
    }

    private recordErrorMetrics(
        request: any,
        error: any,
        duration: number,
        traceId: string,
        spanId: string
    ): void {
        const timestamp = new Date();

        this.recordMetric({
            timestamp,
            name: 'http_request_errors_total',
            value: 1,
            type: 'counter',
            service: this.options.serviceName!,
            method: request.method,
            path: request.path,
            userId: request.user?.id,
            requestId: request.requestId,
            traceId,
            spanId,
            labels: {
                method: request.method,
                errorType: error.name,
                status: error.status || 500,
            }
        });
    }

    private recordMetric(metricData: any): void {
        // This will be implemented by the observability service
        // For now, we'll just log it
        this.logger.debug(`Metric: ${JSON.stringify(metricData)}`);
    }

    private normalizePath(path: string): string {
        // Replace dynamic segments with placeholders
        return path.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '/:id');
    }

    private sanitizeBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'auth'];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}