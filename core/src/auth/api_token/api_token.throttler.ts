import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ApiTokenThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    if (context.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      const req = ctx.req ?? ctx.request;
      const res = ctx.res ??
        ctx.response ?? { header: () => {}, setHeader: () => {} };
      return { req, res };
    }
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;

    // Check for API Token
    const authHeader = request.headers?.['authorization'];
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer sk_')
    ) {
      return authHeader.split(' ')[1];
    }

    // Fallback to IP if no API Token provided
    if (Array.isArray(request.ips) && request.ips.length) {
      return request.ips[0];
    }
    return request.ip ?? '127.0.0.1';
  }

  protected errorMessage = 'API Rate Limit Exceeded';
}
