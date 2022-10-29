import {Args, Int, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {MemberProfile, Organization, Player} from "$models";
import {Member} from "$models";
import {MemberRepository} from "$repositories";

import {PopulateService} from "../../../util/populate/populate.service";

@Resolver(() => Member)
export class MemberResolver {
    constructor(private readonly memberRepository: MemberRepository, private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(@Root() member: Partial<Member>): Promise<MemberProfile> {
        return member.profile ?? this.popService.populateOneOrFail(Member, member as Member, "profile");
    }

    @ResolveField()
    async organization(@Root() member: Partial<Member>): Promise<Organization> {
        return member.organization ?? this.popService.populateOneOrFail(Member, member as Member, "organization");
    }

    @ResolveField()
    async players(@Root() member: Partial<Member>): Promise<Player[]> {
        return member.players ?? this.popService.populateMany(Member, member as Member, "players");
    }

    @Query(() => Member)
    async getMemberByUserId(
        @Args("userId", {type: () => Int}) userId: number,
        @Args("organizationId", {type: () => Int}) organizationId: number,
    ): Promise<Member> {
        return this.memberRepository.get({
            where: {organization: {id: organizationId}, user: {id: userId}},
        });
    }
}
