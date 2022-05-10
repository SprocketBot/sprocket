import {
    Args, Int, Mutation, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {Member} from "../../database";
import {MemberRestriction, MemberRestrictionType} from "../../database";
import {MemberService} from "../member/member.service";
import {MemberRestrictionService} from "./member-restriction.service";

@Resolver(() => MemberRestriction)
export class MemberRestrictionResolver {
    constructor(
        private readonly memberRestrictionService: MemberRestrictionService,
        private readonly memberService: MemberService,
    ) {}

    @Query(() => MemberRestriction)
    async getMemberRestrictionById(@Args("id", {type: () => Int}) id: number): Promise<MemberRestriction> {
        return this.memberRestrictionService.getMemberRestrictionById(id);
    }

    @ResolveField()
    async member(@Root() memberRestriction: MemberRestriction): Promise<Member> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!memberRestriction.member) return this.memberService.getMemberById(memberRestriction.memberId);
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
        @Args("manualExpiration", {type: () => Date}) manualExpiration: Date,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionService.updateMemberRestriction(id, {manualExpiration});
    }

    @Mutation(() => MemberRestriction)
    async deleteMemberRestriction(@Args("id", {type: () => Int}) id: number): Promise<MemberRestriction> {
        return this.memberRestrictionService.deleteMemberRestriction(id);
    }
}
