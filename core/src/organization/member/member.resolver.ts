import {
    Args, Int, Query, ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {MemberProfile} from "../../database";
import {Member} from "../../database";
import {MemberService} from "./member.service";

@Resolver(() => Member)
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}

    @ResolveField()
    async profile(@Root() member: Partial<Member>): Promise<MemberProfile> {
        return member.profile ?? (await this.memberService.getMember({where: {id: member.id}, relations: ["profile"] })).profile;
    }

    @Query(() => Member)
    async getMemberByUserId(
        @Args("userId", {type: () => Int}) userId: number,
        @Args("organizationId", {type: () => Int})organizationId: number,
    ): Promise<Member> {
        return this.memberService.getMember({where: {organization: {id: organizationId}, user: {id: userId} } });
    }
}
