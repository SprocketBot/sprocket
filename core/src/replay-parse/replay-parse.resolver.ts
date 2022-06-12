import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import {
    GqlReplaySubmission,
    ReplaySubmission,
} from "./types";

@Resolver(() => GqlReplaySubmission)
export class ReplaySubmissionResolver {
    @ResolveField(() => Number)
    ratifications(@Root() submission: ReplaySubmission): number {
        return submission.ratifiers.length;
    }
}

