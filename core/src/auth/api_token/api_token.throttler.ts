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
      return { req: ctx.request, res: ctx.response };
    }
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;
    
    // Check for API Token
    const authHeader = request.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer sk_')) {
      return authHeader.split(' ')[1];
    }

    // Fallback to IP if no API Token provided
    return request.ips.length ? request.ips[0] : request.ip;
  }

  protected errorMessage = 'API Rate Limit Exceeded';
}
