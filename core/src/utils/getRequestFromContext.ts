import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';

export const getRequestFromContext = (e: ExecutionContext): Request | null => {
  // @ts-expect-error graphql appears but is not typed for some reason
  if (e.getType() === 'graphql') {
    return GqlExecutionContext.create(e).getContext().request || null;
  } else if (e.getType() === 'http') {
    return e.switchToHttp().getRequest();
  } else {
    return null;
  }
};
