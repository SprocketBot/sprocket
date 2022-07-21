import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {
    CurrentUser, UserPayload, UserService,
} from "../identity";
import {
    GqlReplaySubmission,
    ReplaySubmission, SubmissionRejection,
} from "./types";

@Resolver(() => GqlReplaySubmission)
export class ReplaySubmissionResolver {
    @ResolveField(() => Number)
    ratifications(@Root() submission: ReplaySubmission): number {
        return submission.ratifiers.length;
    }

    @ResolveField(() => Boolean)
    userHasRatified(@CurrentUser() cu: UserPayload, @Root() submission: ReplaySubmission): boolean {

        return submission.ratifiers.some(r => r.toString() === cu.userId.toString());
    }
}

@Resolver(() => SubmissionRejection)
export class SubmissionRejectionResolver {
    constructor(private readonly userService: UserService) {}

    @ResolveField(() => String)
    async playerName(@Root() rejection: SubmissionRejection): Promise<string> {
        if (rejection.playerName) return rejection.playerName;
        if (rejection.playerId.toString() === "system") return "Sprocket";
        // TODO: Is it possible to map to an organization from here?

        const user = await this.userService.getUserById(parseInt(rejection.playerId.toString()));
        return user.profile.displayName;
    }

    @ResolveField(() => String)
    async reason(@Root() rejection: SubmissionRejection): Promise<string> {
        if (rejection.playerId.toString() !== "system") return rejection.reason;
        const errors  = JSON.parse(rejection.reason) as Array<{error: string;}>;
        return errors?.map(e => e.error).join("\n") ?? "";

    }
}
