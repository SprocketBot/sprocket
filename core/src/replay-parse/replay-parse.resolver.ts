import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID } from '@sprocketbot/common';

import { CurrentUser, UserPayload, UserService } from '../identity';
import { GqlRatifierInfo, GqlReplaySubmission, ReplaySubmission, SubmissionRejection } from './types';

@Resolver(() => GqlReplaySubmission)
export class ReplaySubmissionResolver {
  @ResolveField(() => [GqlRatifierInfo])
  ratifiers(@Root() submission: ReplaySubmission): GqlRatifierInfo[] {
    // Transform ratifiers to GraphQL format, handling both old number[] and new RatifierInfo[] formats
    return submission.ratifiers.map((r: number | GqlRatifierInfo) => {
      if (typeof r === 'number') {
        // Legacy format: just a player ID
        return {
          playerId: r,
          franchiseId: 0,
          franchiseName: 'Unknown',
          ratifiedAt: new Date().toISOString(),
        };
      }
      // New format: already a RatifierInfo object
      return r as GqlRatifierInfo;
    });
  }

  @ResolveField(() => Number)
  ratifications(@Root() submission: ReplaySubmission): number {
    return submission.ratifiers.length;
  }

  @ResolveField(() => Boolean)
  userHasRatified(@CurrentUser() cu: UserPayload, @Root() submission: ReplaySubmission): boolean {
    // Handle both old number[] format and new RatifierInfo[] format for backward compatibility
    return submission.ratifiers.some((r: number | GqlRatifierInfo) => {
      const ratifierId = typeof r === 'number' ? r : r.playerId;
      return ratifierId.toString() === cu.userId.toString();
    });
  }
}

@Resolver(() => SubmissionRejection)
export class SubmissionRejectionResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => String)
  async playerName(@Root() rejection: SubmissionRejection): Promise<string> {
    if (rejection.playerName) return rejection.playerName;
    if (rejection.playerId === REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID) return 'Sprocket';
    // TODO: Is it possible to map to an organization from here?

    const user = await this.userService.getUserById(parseInt(rejection.playerId.toString()));
    return user.profile.displayName;
  }

  @ResolveField(() => String)
  async reason(@Root() rejection: SubmissionRejection): Promise<string> {
    return rejection.reason;
  }
}
