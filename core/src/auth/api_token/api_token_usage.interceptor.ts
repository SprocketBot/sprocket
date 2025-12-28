import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiTokenService } from './api_token.service';

@Injectable()
export class ApiTokenUsageInterceptor implements NestInterceptor {
    constructor(private readonly apiTokenService: ApiTokenService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let request;
        if (context.getType() === 'http') {
            request = context.switchToHttp().getRequest();
        } else {
            const ctx = GqlExecutionContext.create(context);
            request = ctx.getContext().request;
        }

        return next.handle().pipe(tap(async () => {
            if (request && request.apiToken) {
                // Determine usage details
                const endpoint = request.url || 'graphql'; // GraphQL usually just has /graphql
                // For GQL, we might want operation name, but let's stick to basic
                const method = request.method;
                const statusCode = request.res ? request.res.statusCode : 200; // access response status if possible
                const ipAddress = request.ip || request.connection?.remoteAddress || 'unknown';
                const userAgent = request.headers['user-agent'];

                await this.apiTokenService.recordUsage(request.apiToken, {
                    endpoint,
                    method,
                    statusCode,
                    ipAddress,
                    userAgent,
                    wasBlocked: false, // Interceptor runs if guard succeeded
                });
            }
        }));
    }
}
