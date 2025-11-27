import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        // 1. Determine the Status Code
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // 2. Extract Context (Who and What)
        // Note: 'request.user' might be undefined for 401s if the AuthGuard failed early
        const user = request.user ? `User: ${request.user.id || request.user.email}` : 'User: Guest';
        const contextInfo = `[${request.method}] ${request.url} - ${user}`;

        // 3. Conditional Logging
        if (httpStatus === HttpStatus.UNAUTHORIZED || httpStatus === HttpStatus.FORBIDDEN) {
            // WARN LEVEL: No stack trace, just the context.
            this.logger.warn(`Security Event: ${httpStatus} for ${contextInfo}`);
        } else if (httpStatus >= 500) {
            // ERROR LEVEL: Full noise and stack trace needed here.
            this.logger.error(
                `System Error: ${httpStatus} for ${contextInfo}`,
                (exception as Error).stack
            );
        } else {
            // OPTIONAL: Log other 4xx errors (like 400 Bad Request) as verbose/debug
            this.logger.verbose(`Client Error: ${httpStatus} for ${contextInfo}`);
        }

        // 4. Construct the response body
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: (exception instanceof HttpException) ? exception.message : 'Internal server error',
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}