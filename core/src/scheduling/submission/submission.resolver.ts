import {UseGuards} from "@nestjs/common";
import {ResolveField, Resolver, Root} from "@nestjs/graphql";
import {REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID} from "@sprocketbot/common";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {UserProfileRepository} from "../../identity/database/user-profile.repository";
import {SubmissionObject} from "../graphql/submission/submission.object";
import {SubmissionRejectionObject} from "../graphql/submission/submission-rejection.object";

@Resolver(() => SubmissionObject)
export class SubmissionResolver {
    @ResolveField(() => Number)
    ratifications(@Root() submission: SubmissionObject): number {
        return submission.ratifiers.length;
    }

    @ResolveField(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard)
    userHasRatified(@AuthenticatedUser() user: JwtAuthPayload, @Root() submission: SubmissionObject): boolean {
        return submission.ratifiers.some(r => r.toString() === user.userId.toString());
    }
}

@Resolver(() => SubmissionRejectionObject)
export class SubmissionRejectionResolver {
    constructor(private readonly userProfileRepository: UserProfileRepository) {}

    @ResolveField(() => String)
    async playerName(@Root() rejection: SubmissionRejectionObject): Promise<string> {
        if (rejection.userId === REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID) return "Sprocket";
        // TODO: Is it possible to map to an organization from here?

        const profile = await this.userProfileRepository.getByUserId(rejection.userId);
        return profile.displayName;
    }
}
