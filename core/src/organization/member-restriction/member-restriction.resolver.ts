import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {Member} from "../../database";
import {MemberRestriction, MemberRestrictionType} from "../../database";
import {MemberRestrictionService} from "./member-restriction.service";

@Resolver(() => MemberRestriction)
export class MemberRestrictionResolver {
    constructor(private readonly memberRestrictionService: MemberRestrictionService) {}

    @Query(() => MemberRestriction)
    async getMemberRestrictionById(@Args("id", {type: () => Int}) id: number): Promise<MemberRestriction> {
        return this.memberRestrictionService.getMemberRestrictionById(id);
    }

    @ResolveField()
    async member(@Root() memberRestriction: MemberRestriction): Promise<Member> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!memberRestriction.member) {
            const {member} = await this.memberRestrictionService.getMemberRestrictionById(memberRestriction.id, {relations: ["member"] });
            return member;
        }
        return memberRestriction.member;
    }

    @Mutation(() => MemberRestriction)
    async createMemberRestriction(
        @Args("type", {type: () => MemberRestrictionType}) type: MemberRestrictionType,
        @Args("expiration", {type: () => Date}) expiration: Date,
        @Args("memberId", {type: () => Int}) memberId: number,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionService.createMemberRestriction(type, expiration, memberId);
    }

    @Mutation(() => MemberRestriction)
    async updateMemberRestriction(
        @Args("id", {type: () => Int}) id: number,
        @Args("expiration", {type: () => Date}) expiration: Date,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionService.updateMemberRestriction(id, {expiration});
    }

    @Mutation(() => MemberRestriction)
    async deleteMemberRestriction(@Args("id", {type: () => Int}) id: number): Promise<MemberRestriction> {
        return this.memberRestrictionService.deleteMemberRestriction(id);
    }
}
