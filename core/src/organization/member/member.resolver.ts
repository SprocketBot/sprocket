import {Args, Int, Query, ResolveField, Resolver, Root} from "@nestjs/graphql";

import type {MemberProfile, Organization, Player} from "../../database";
import {Member} from "../../database";
import {MemberRepository} from "../../database/repositories";
import {PopulateService} from "../../util/populate/populate.service";

@Resolver(() => Member)
export class MemberResolver {
    constructor(private readonly memberRepository: MemberRepository, private readonly popService: PopulateService) {}

    @ResolveField()
    async profile(@Root() member: Member): Promise<MemberProfile> {
        if (member.profile) return member.profile;

        return this.popService.populateOneOrFail(Member, member, "profile");
    }

    @ResolveField()
    async organization(@Root() member: Member): Promise<Organization> {
        if (member.organization) return member.organization;
        return this.popService.populateOneOrFail(Member, member, "organization");
    }

    @ResolveField()
    async players(@Root() member: Member): Promise<Player[]> {
        if (member.players) return member.players;
        return this.popService.populateMany(Member, member, "players");
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
