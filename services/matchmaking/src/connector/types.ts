import { Scrim, TypedClientProxy } from '@sprocketbot/lib/types';
import { MatchmakingEndpoint } from '../constants';

export type MatchmakingProxy = TypedClientProxy<
  MatchmakingEndpoint,
  never,
  {
    [MatchmakingEndpoint.test]: {
      requestData: string;
      responseData: string;
    };
    [MatchmakingEndpoint.CreateScrim]: {
      requestData: { memberId: string };
      responseData: Scrim;
    };
  },
  never
>;
