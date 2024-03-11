import { ExecutionContext, Logger, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import { getRequestFromContext } from '../../utils/getRequestFromContext';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    switch (context.getType()) {
      // @ts-expect-error graphql should exist, but does not
      case 'graphql':
      case 'http':
        const req: Request = getRequestFromContext(context);
        return req.user;
      default:
        logger.warn('User is not available outside of HTTP Context');
        return null;
    }
  },
);
const logger = new Logger(CurrentUser.name);
