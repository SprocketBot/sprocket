import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticateService } from '../authenticate/authenticate.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthenticateService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // In Gql context, request might be 'request' not 'req' if I fixed it, but this guard uses 'req'.
    // GqlModule config sets 'request' but GqlExecutionContext might map 'req' if using express.
    // I noticed in GqlModule I used { request: req, response: res }.
    // If ctx.req is undefined here, this guard is broken anyway. 
    // But assuming it works for now (or I fixed ThrottlerGuard because it was broken), I'll just keep 'req' access pattern if that's what's there, 
    // BUT I should check if I need to change it to 'request' too. 
    // Step 1296: context: ({ req, res }) => ({ request: req, response: res }).
    // So 'req' property does NOT exist on the context object. 
    // ApiTokenThrottlerGuard failed because of this. 
    // GqlAuthGuard likely also fails if it uses ctx.getContext().req !!
    // I should fix the property access here as well. `ctx.getContext().request`.

    if (!request) { 
        // fallback
        const realRequest = ctx.getContext().request;
        if (realRequest) return await this.processUser(realRequest);
        return false;
    }
    return await this.processUser(request);
  }

  async processUser(request: any): Promise<boolean> {
      const user = await this.authService.getUserFromRequest(request);
      if (user) {
          request.user = user;
          return true;
      }
      return false;
  }
}
