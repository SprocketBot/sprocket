import {
    ResolveField, Resolver, Root,
} from "@nestjs/graphql";

import type {MemberProfile} from "../../database";
import {Member} from "../../database";
import {MemberService} from "./member.service";

@Resolver(() => Member)
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}

    @ResolveField()
    async profile(@Root() member: Partial<Member>): Promise<MemberProfile> {
        return member.profile ?? await this.memberService.getMemberProfile(member.id!);
    }
}
