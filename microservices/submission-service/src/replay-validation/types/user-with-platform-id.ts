import type { GetUserByAuthAccountResponse } from '@sprocketbot/common';

export type UserWithPlatformId = GetUserByAuthAccountResponse & {
  platform: string;
  platformId: string;
};
