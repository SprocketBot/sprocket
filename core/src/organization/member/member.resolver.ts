import {
    Args, Int, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";
import {compareDesc} from "date-fns";
import {now} from "lodash";

import type {
    MemberProfile, MemberRestriction, Organization, Player,
} from "../../database";
import {Member, MemberRestrictionType} from "../../database";
import {PopulateService} from "../../util/populate/populate.service";
import {MemberService} from "./member.service";

const activeMemberRestrictionsFilter = (r: MemberRestriction): boolean => {
    if (!r.manualExpiration) return compareDesc(now(), r.expiration) > 0;
    return compareDesc(now(), r.manualExpiration) > 0;
};

@Resolver(() => Member)
export class MemberResolver {
    constructor(
        private readonly memberService: MemberService,
        private readonly popService: PopulateService,
    ) {}

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

    @ResolveField()
    async restrictions(
        @Root() member: Member,
        @Args("type", {type: () => MemberRestrictionType, nullable: true}) type?: MemberRestrictionType,
        @Args("active", {nullable: true}) active?: boolean,
    ): Promise<MemberRestriction[]> {
        const restrictions = member.restrictions ?? await this.popService.populateMany(Member, member, "restrictions");

        if (!type && active === undefined) return restrictions;
        else if (type && active === undefined) return restrictions.filter(r => r.type === type);
        else if (!type && active === true) return restrictions.filter(activeMemberRestrictionsFilter);
        return restrictions.filter(r => r.type === type).filter(activeMemberRestrictionsFilter);
    }

    @Query(() => Member)
    async getMemberByUserId(
        @Args("userId", {type: () => Int}) userId: number,
        @Args("organizationId", {type: () => Int})organizationId: number,
    ): Promise<Member> {
        return this.memberService.getMember({where: {organization: {id: organizationId}, user: {id: userId} } });
    }
}
