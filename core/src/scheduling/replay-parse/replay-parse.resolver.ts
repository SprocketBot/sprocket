import {UseGuards} from "@nestjs/common";
import {ResolveField, Resolver, Root} from "@nestjs/graphql";
import {REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID} from "@sprocketbot/common";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {UserProfileRepository} from "../../identity/database/user-profile.repository";
import {GqlReplaySubmission, ReplaySubmission, SubmissionRejection} from "./types";

@Resolver(() => GqlReplaySubmission)
export class ReplaySubmissionResolver {
    @ResolveField(() => Number)
    ratifications(@Root() submission: ReplaySubmission): number {
        return submission.ratifiers.length;
    }

    @ResolveField(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard)
    userHasRatified(@AuthenticatedUser() cu: JwtAuthPayload, @Root() submission: ReplaySubmission): boolean {
        return submission.ratifiers.some(r => r.toString() === cu.userId.toString());
    }
}

@Resolver(() => SubmissionRejection)
export class SubmissionRejectionResolver {
    constructor(private readonly userProfileRepository: UserProfileRepository) {}

    @ResolveField(() => String)
    async playerName(@Root() rejection: SubmissionRejection): Promise<string> {
        if (rejection.playerName) return rejection.playerName;
        if (rejection.userId === REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID) return "Sprocket";
        // TODO: Is it possible to map to an organization from here?

        const profile = await this.userProfileRepository.getByUserId(rejection.userId);
        return profile.displayName;
    }

    @ResolveField(() => String)
    async reason(@Root() rejection: SubmissionRejection): Promise<string> {
        return rejection.reason;
    }
}
