import { type User as SprocketUser } from '@sprocketbot/lib/types';
declare global {
  namespace Express {
    export type User = SprocketUser;
  }
}

export {};
