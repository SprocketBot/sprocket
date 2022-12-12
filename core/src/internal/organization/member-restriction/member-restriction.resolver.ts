import {Inject, UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Query, ResolveField, Resolver, Root, Subscription} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {MLE_OrganizationTeam} from "$mledb";
import type {Member} from "$models";
import {MemberRestriction} from "$models";
import {MemberRestrictionRepository} from "$repositories";
import {MemberRestrictionType} from "$types";

import {GraphQLJwtAuthGuard} from "../../../authentication/guards";
import {MLEOrganizationTeamGuard} from "../../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../../util/populate/populate.service";
import {MemberPubSub} from "../constants";
import {MemberService} from "../member/member.service";
import {MemberRestrictionEvent} from "./member-restriction.types";

@Resolver(() => MemberRestriction)
export class MemberRestrictionResolver {
    constructor(
        private readonly memberRestrictionRepository: MemberRestrictionRepository,
        private readonly memberService: MemberService,
        private readonly populateService: PopulateService,
        @Inject(MemberPubSub) private readonly pubSub: PubSub,
    ) {}

    @Query(() => [MemberRestriction])
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async getActiveMemberRestrictions(
        @Args("type", {type: () => MemberRestrictionType})
        type: MemberRestrictionType,
    ): Promise<MemberRestriction[]> {
        return this.memberRestrictionRepository.getActiveRestrictions(type);
    }

    @Mutation(() => MemberRestriction)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async createMemberRestriction(
        @Args("type", {type: () => MemberRestrictionType})
        type: MemberRestrictionType,
        @Args("expiration", {type: () => Date}) expiration: Date,
        @Args("reason") reason: string,
        @Args("memberId", {type: () => Int}) memberId: number,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionRepository.createAndSave({type, expiration, reason, memberId});
    }

    @Mutation(() => MemberRestriction)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async manuallyExpireMemberRestriction(
        @Args("id", {type: () => Int}) id: number,
        @Args("manualExpiration", {type: () => Date}) manualExpiration: Date,
        @Args("manualExpirationReason", {type: () => String})
        manualExpirationReason: string,
        @Args("forgiven", {
            type: () => Boolean,
            nullable: true,
            defaultValue: false,
        })
        forgiven = false,
    ): Promise<MemberRestriction> {
        return this.memberRestrictionRepository.manuallyExpireRestriction(
            id,
            manualExpiration,
            manualExpirationReason,
            forgiven,
        );
    }

    @ResolveField()
    async member(@Root() memberRestriction: Partial<MemberRestriction>): Promise<Member> {
        return (
            memberRestriction.member ??
            (await this.populateService.populateOneOrFail(
                MemberRestriction,
                memberRestriction as MemberRestriction,
                "member",
            ))
        );
    }

    @Subscription(() => MemberRestrictionEvent)
    async followRestrictedMembers(): Promise<AsyncIterator<MemberRestrictionEvent>> {
        await this.memberService.enableSubscription();
        return this.pubSub.asyncIterator(this.memberService.restrictedMembersSubTopic);
    }
}
