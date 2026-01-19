import { Args, Int, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';

import type { Player } from '$db/franchise/player/player.model';
import { Member } from '$db/organization/member/member.model';
import type { MemberProfile } from '$db/organization/member_profile/member_profile.model';
import type { Organization } from '$db/organization/organization/organization.model';

import { PopulateService } from '../../util/populate/populate.service';
import { MemberService } from './member.service';

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly popService: PopulateService,
  ) {}

  @ResolveField()
  async profile(@Root() member: Member): Promise<MemberProfile> {
    if (member.profile) return member.profile;

    return this.popService.populateOneOrFail(Member, member, 'profile');
  }

  @ResolveField()
  async organization(@Root() member: Member): Promise<Organization> {
    if (member.organization) return member.organization;
    return this.popService.populateOneOrFail(Member, member, 'organization');
  }

  @ResolveField()
  async players(@Root() member: Member): Promise<Player[]> {
    if (member.players) return member.players;
    return this.popService.populateMany(Member, member, 'players');
  }

  @Query(() => Member)
  async getMemberByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('organizationId', { type: () => Int }) organizationId: number,
  ): Promise<Member> {
    return this.memberService.getMember({
      where: { organization: { id: organizationId }, user: { id: userId } },
    });
  }
}
