import { Controller, Get, Inject, Logger, UseInterceptors } from '@nestjs/common';
import { ObservabilityService, ObservabilityInterceptor } from '@sprocketbot/lib';

@Controller('test-observability')
@UseInterceptors(ObservabilityInterceptor)
export class TestObservabilityController {
    private readonly logger = new Logger(TestObservabilityController.name);

    constructor(
        @Inject('OBSERVABILITY_SERVICE')
        private readonly observabilityService: ObservabilityService
    ) { }

    @Get('log-test')
    async testLogging() {
        // Test different log levels
        await this.observabilityService.info('This is an info message', 'TestContext', {
            service: 'test-service',
            userId: 'test-user-123',
            requestId: 'req-123',
            traceId: 'trace-123',
            spanId: 'span-123'
        });

        await this.observabilityService.warn('This is a warning message', 'TestContext', {
            service: 'test-service'
        });

        await this.observabilityService.error('This is an error message', new Error('Test error'), 'TestContext', {
            service: 'test-service'
        });

        await this.observabilityService.debug('This is a debug message', 'TestContext', {
            service: 'test-service'
        });

        return { message: 'Logging test completed' };
    }

    @Get('metric-test')
    async testMetrics() {
        // Test different metric types
        await this.observabilityService.incrementCounter('test_requests_total', 1, {
            method: 'GET',
            endpoint: '/test-observability/metric-test'
        }, {
            service: 'test-service'
        });

        await this.observabilityService.recordGauge('test_active_connections', 5, {
            service: 'test-service',
            region: 'us-east-1'
        }, {
            service: 'test-service'
        });

        await this.observabilityService.recordHistogram('test_response_time', 0.25, {
            method: 'GET',
            endpoint: '/test-observability/metric-test'
        }, 'seconds', {
            service: 'test-service'
        });

        return { message: 'Metrics test completed' };
    }

    @Get('auto-instrumentation-test')
    async testAutoInstrumentation() {
        // This endpoint will be automatically instrumented by the interceptor
        // It will log the request and response, and record metrics
        this.logger.log('Processing auto-instrumentation test request');

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            message: 'Auto-instrumentation test completed',
            timestamp: new Date().toISOString()
        };
    }

    @Get('error-test')
    async testErrorHandling() {
        // This will test error logging and error metrics
        throw new Error('This is a test error for observability');
    }
}