import {
    Args, Int, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {
    MemberProfile, Organization, Player,
} from "../../database";
import {Member} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";
import {MemberService} from "./member.service";

@Resolver(() => Member)
export class MemberResolver {
    constructor(
        private readonly memberService: MemberService,
        private readonly popService: PopulateService,
    ) {}

    @ResolveField()
    async profile(@Root() member: Partial<Member>): Promise<MemberProfile> {
        return member.profile ?? (await this.memberService.getMember({where: {id: member.id}, relations: ["profile"] })).profile;
    }

    @ResolveField()
    async organization(@Root() member: Member): Promise<Organization> {
        return this.popService.populateOneOrFail(Member, member, "organization");
    }

    @ResolveField()
    async players(@Root() member: Member): Promise<Player[]> {
        return this.popService.populateMany(Member, member, "players");
    }

    @Query(() => Member)
    async getMemberByUserId(
        @Args("userId", {type: () => Int}) userId: number,
        @Args("organizationId", {type: () => Int})organizationId: number,
    ): Promise<Member> {
        return this.memberService.getMember({where: {organization: {id: organizationId}, user: {id: userId} } });
    }
}
