import type {
    ArgumentsHost,
    ExceptionFilter,
} from "@nestjs/common";
import {
    Catch,
    HttpException,
    Logger,
} from "@nestjs/common";
import type {Response} from "express";

/**
 * Catches any unhandled error in a NestJS microservice
 *
 * Should be used when in `main.ts` `bootstrap()` creating a new microservice
 * @example
 * async function bootstrap(): Promise<void> {
 *     const app = await NestFactory.createMicroservice(AppModule, {
 *         // ...
 *     });
 *     app.useGlobalFilters(new AllExceptionsFilter());
 *     await app.listen();
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        this.logger.error(exception);

        if (exception instanceof HttpException) {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse<Response>();
            const status = exception.getStatus();

            response
                .status(status)
                .json({
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    message: exception.message,
                });
        }
    }
}
