// import {UseGuards} from "@nestjs/common";
// import {MLE_OrganizationTeam} from "../../database/mledb";
// import {MLEOrganizationTeamGuard} from "../../mledb";
import {Inject, UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Query, ResolveField, Resolver, Root, Subscription,} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import type {Member} from "../../database";
import {MemberRestriction, MemberRestrictionType} from "../../database";
import {MemberPubSub} from "../constants";
import {MemberService} from "../member/member.service";
import {MemberRestrictionService} from "./member-restriction.service";
import {MemberRestrictionEvent} from "./member-restriction.types";
import {MLEOrganizationTeamGuard} from "../../mledb";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";

@Resolver(() => MemberRestriction)
export class MemberRestrictionResolver {
    constructor(
        private readonly memberRestrictionService: MemberRestrictionService,
        private readonly memberService: MemberService,
        @Inject(MemberPubSub) private readonly pubSub: PubSub,
    ) {}

    @Query(() => [MemberRestriction])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async getActiveMemberRestrictions(@Args("type", {type: () => MemberRestrictionType}) type: MemberRestrictionType): Promise<MemberRestriction[]> {
        return this.memberRestrictionService.getActiveMemberRestrictions(type);
    }

    @Mutation(() => MemberRestriction)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async createMemberRestriction(
        @Args("type", {type: () => MemberRestrictionType}) type: MemberRestrictionType,
        @Args("expiration", {type: () => Date}) expiration: Date,
        @Args("reason") reason: string,
        @Args("memberId", {type: () => Int}) memberId: number,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionService.createMemberRestriction(type, expiration, reason, memberId);
    }

    @Mutation(() => MemberRestriction)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async manuallyExpireMemberRestriction(
        @Args("id", {type: () => Int}) id: number,
        @Args("manualExpiration", {type: () => Date}) manualExpiration: Date,
        @Args("manualExpirationReason", {type: () => String}) manualExpirationReason: string,
        @Args("forgiven", {
            type: () => Boolean, nullable: true, defaultValue: false,
        }) forgiven: boolean = false,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionService.manuallyExpireMemberRestriction(id, manualExpiration, manualExpirationReason, forgiven);
    }

    @ResolveField()
    async member(@Root() memberRestriction: Partial<MemberRestriction>): Promise<Member> {
        return memberRestriction.member ?? await this.memberService.getMemberById(memberRestriction.memberId!);
    }

    @Subscription(() => MemberRestrictionEvent)
    async followRestrictedMembers(): Promise<AsyncIterator<MemberRestrictionEvent>> {
        await this.memberService.enableSubscription();
        return this.pubSub.asyncIterator(this.memberService.restrictedMembersSubTopic);
    }
}
