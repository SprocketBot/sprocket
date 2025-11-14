import { TypedClientProxy } from '@sprocketbot/lib/types';
import { MatchmakingEndpoint, MatchmakingEvents } from '../constants';
import {
  AddUserToScrimPayload,
  CreateScrimPayload,
  DestroyScrimPayload,
  GetScrimForUserPayload,
  GetScrimPendingTTLPayload,
  JoinScrimPayload,
  LeaveScrimPayload,
  ListScrimsPayload,
  RemoveUserFromScrimPayload,
  Scrim,
} from './schemas';

export type MatchmakingEndpointMap = {
  [MatchmakingEndpoint.CreateScrim]: {
    requestData: CreateScrimPayload;
    responseData: Scrim;
  };
  [MatchmakingEndpoint.DestroyScrim]: {
    requestData: DestroyScrimPayload;
    responseData: Scrim;
  };
  [MatchmakingEndpoint.JoinScrim]: {
    requestData: JoinScrimPayload;
    responseData: Scrim;
  };
  [MatchmakingEndpoint.LeaveScrim]: {
    requestData: LeaveScrimPayload;
    responseData: boolean;
  };
  [MatchmakingEndpoint.ListScrims]: {
    requestData: ListScrimsPayload;
    responseData: Scrim[];
  };
  [MatchmakingEndpoint.GetScrimForUser]: {
    requestData: GetScrimForUserPayload;
    responseData: Scrim | false;
  };
  [MatchmakingEndpoint.RemoveUserFromScrim]: {
    requestData: RemoveUserFromScrimPayload;
    responseData: Scrim;
  };
  [MatchmakingEndpoint.GetScrimPendingTTL]: {
    requestData: GetScrimPendingTTLPayload;
    responseData: number;
  };
  [MatchmakingEndpoint.AddUserToScrim]: {
    requestData: AddUserToScrimPayload;
    responseData: Scrim;
  };
};

export type MatchmakingProxy = TypedClientProxy<
  MatchmakingEndpoint,
  MatchmakingEvents,
  MatchmakingEndpointMap,
  {
    [MatchmakingEvents.ScrimUpdated]: {
      payload: Scrim;
    };
  }
>;
