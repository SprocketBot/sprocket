import type {ArgumentsHost, ExceptionFilter} from "@nestjs/common";
import {Catch, HttpException, Logger} from "@nestjs/common";
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
        if (exception instanceof Error) {
            this.logger.error({
                name: exception.name,
                message: exception.message,
                stack: exception.stack,
            });
        } else {
            this.logger.error(`[NOT ERROR SUBTYPE] ${JSON.stringify(exception)}`);
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (["graphql", "rpc"].includes(host.getType())) {
            // GraphQL and RPC do not have normal response methods (status/json), so there's nothing else we can do.
            // Matchmaking service was crashing wish `response.status is not a function` on throwing an error.
            return;
        } else if (exception instanceof HttpException) {
            const status = exception.getStatus();

            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                message: exception.message,
            });
        } else {
            response.status(500).json({
                statusCode: 500,
                timestamp: new Date().toISOString(),
                message: "Internal Server Error",
            });
        }
    }
}
