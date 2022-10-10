import {type ExceptionFilter, Catch, Logger} from "@nestjs/common";

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

    catch(exception: unknown): void {
        this.logger.error("Uncaught exception", exception);
    }
}
