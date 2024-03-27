import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';

export const getRequestFromContext = (e: ExecutionContext): Request | null => {
  switch (e.getType()) {
    // @ts-expect-error graphql appears but is not typed for some reason
    case 'graphql':
      const gqlContext = GqlExecutionContext.create(e).getContext();
      return gqlContext.req ?? gqlContext.request ?? null;
    case 'http':
      return e.switchToHttp().getRequest();
    default:
      return null;
  }
};
