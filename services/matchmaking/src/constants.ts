import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

export const MatchmakingQueue = 'sprocket-matchmaking';
export const MatchmakingQueueOptions: AmqplibQueueOptions = {
  durable: true,
};

export enum MatchmakingEndpoint {
  CreateScrim = 'CreateScrim',
  DestroyScrim = 'DestroyScrim',
  JoinScrim = 'JoinScrim',
  LeaveScrim = 'LeaveScrim',
  ListScrims = 'ListScrims',
  GetScrimForUser = 'GetScrimForUser',
  RemoveUserFromScrim = 'RemovePlayerFromScrim',
  GetScrimPendingTTL = 'GetScrimPendingTTL',
  AddUserToScrim = 'AddUserToScrim',
}

export enum MatchmakingEvents {
  AllScrim = 'Scrim:*',
  ScrimUpdated = 'Scrim:Updated',
}

export enum ScrimState {
  // Normal Scrim Flow
  PENDING = 'PENDING',
  POPPED = 'POPPED',
  IN_PROGRESS = 'IN_PROGRESS',
  RATIFYING = 'RATIFYING',
  COMPLETE = 'COMPLETE',

  // Abnormal States
  LOCKED = 'LOCKED',
  CANCELLED = 'CANCELLED',
}
