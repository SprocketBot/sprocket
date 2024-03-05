import { SetMetadata } from '@nestjs/common';
import { AuthorizationInput } from '../constants';

export const Authorize = (...auths: AuthorizationInput[]) =>
  SetMetadata('authorize', auths);
