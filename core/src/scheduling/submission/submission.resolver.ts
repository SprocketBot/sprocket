import {UseGuards} from "@nestjs/common";
import {ResolveField, Resolver, Root} from "@nestjs/graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {SubmissionObject} from "../graphql/submission/submission.object";

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
