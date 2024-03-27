import { Scrim, TypedClientProxy } from '@sprocketbot/lib/types';
import { MatchmakingEndpoint } from '../constants';
import { CreateScrimPayload } from './schemas';

export type MatchmakingProxy = TypedClientProxy<
  MatchmakingEndpoint,
  never,
  {
    [MatchmakingEndpoint.test]: {
      requestData: string;
      responseData: string;
    };
    [MatchmakingEndpoint.CreateScrim]: {
      requestData: CreateScrimPayload;
      responseData: Scrim;
    };
  },
  never
>;
