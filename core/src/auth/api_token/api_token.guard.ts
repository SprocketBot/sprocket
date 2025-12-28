import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiTokenService } from './api_token.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly apiTokenService: ApiTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
      // Logic to support both HTTP and GraphQL contexts
      let request;
      if (context.getType() === 'http') {
          request = context.switchToHttp().getRequest();
      } else {
          const ctx = GqlExecutionContext.create(context);
          request = ctx.getContext().req;
      }

      if (!request) return false;

      const authHeader = request.headers.authorization || request.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer sk_')) {
          // If no token or not our token format, pass (maybe other guards will handle it, or it will fail later)
          // But strict APITokenGuard should probably fail. 
          // However, we might want to allow this guard to be composed with others.
          return true; 
      }

      const token = authHeader.split(' ')[1];
      const apiToken = await this.apiTokenService.validateToken(token);

      if (!apiToken) {
          throw new UnauthorizedException('Invalid API Token');
      }

      // Record usage - validation succeeded so far
      // We might want to record usage AFTER the request logic, but guards run before.
      // A dedicated interceptor might be better for logging validation status + response code.
      // For now, we attach the user to the request.
      
      request.user = apiToken.user;
      request.apiToken = apiToken; // Attach token for potential usage logging later

      return true;
  }
}
