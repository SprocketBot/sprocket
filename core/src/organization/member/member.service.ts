import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService, EventTopic } from '@sprocketbot/common';
import { PubSub } from 'apollo-server-express';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { DataSource, Repository } from 'typeorm';

import type { IrrelevantFields } from '../../database';
import type { Franchise } from '../../database/franchise/franchise/franchise.model';
import { UserAuthenticationAccount } from '../../database/identity/user_authentication_account';
import { MLE_Player, MLE_PlayerAccount } from '../../database/mledb';
import { Member } from '../../database/organization/member/member.model';
import { MemberPlatformAccount } from '../../database/organization/member_platform_account';
import { MemberProfile } from '../../database/organization/member_profile/member_profile.model';
import { PlayerService } from '../../franchise/player/player.service';
import { UserService } from '../../identity/user/user.service';
import { MemberPubSub } from '../constants';
import { OrganizationService } from '../organization';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  private subscribed = false;

  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(MemberProfile) private memberProfileRepository: Repository<MemberProfile>,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly eventsService: EventsService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(MemberPubSub) private readonly pubsub: PubSub,
  ) {}

  get restrictedMembersSubTopic(): string {
    return 'member.restricted';
  }

  async createMember(
    memberProfile: Omit<MemberProfile, IrrelevantFields | 'id' | 'member'>,
    organizationId: number,
    userId: number,
  ): Promise<Member> {
    const organization = await this.organizationService.getOrganizationById(organizationId);
    const user = await this.userService.getUserById(userId);

    const profile = this.memberProfileRepository.create(memberProfile);
    const member = this.memberRepository.create({
      organization,
      user,
    });

    member.profile = profile;

    await this.memberProfileRepository.save(profile);
    await this.memberRepository.save(member);

    return member;
  }

  async getMember(query: FindOneOptions<Member>): Promise<Member> {
    return this.memberRepository.findOneOrFail(query);
  }

  async getMemberById(id: number, options?: FindOneOptions<Member>): Promise<Member> {
    return this.memberRepository.findOneOrFail({
      ...options,
      where: {
        id: id,
        ...options?.where,
      },
    });
  }

  async getMembers(query: FindManyOptions<MemberProfile>): Promise<Member[]> {
    const memberProfiles = await this.memberProfileRepository.find(query);
    return memberProfiles.map(mp => mp.member);
  }

  async updateMemberProfile(
    memberId: number,
    data: Omit<Partial<MemberProfile>, 'member'>,
  ): Promise<MemberProfile> {
    let { profile } = await this.memberRepository.findOneOrFail({
      where: { id: memberId },
      relations: { profile: true },
    });
    profile = this.memberProfileRepository.merge(profile, data);
    await this.memberProfileRepository.save(profile);
    return profile;
  }

  async deleteMember(id: number): Promise<Member> {
    const toDelete = await this.memberRepository.findOneOrFail({
      where: { id },
      relations: { profile: true },
    });
    await this.memberRepository.delete({ id });
    await this.memberProfileRepository.delete({ id: toDelete.profile.id });
    return toDelete;
  }

  async getFranchiseByMember(
    memberId: number,
    organizationId: number,
    gameId: number,
  ): Promise<Franchise | undefined> {
    const player = await this.playerService.getPlayer({
      where: {
        member: {
          id: memberId,
          organization: {
            id: organizationId,
          },
        },
        skillGroup: {
          game: {
            id: gameId,
          },
        },
      },
      relations: [
        'member',
        'member.user',
        'member.organization',
        'skillGroup',
        'skillGroup.game',
        'slot',
        'slot.team',
        'slot.team.franchise',
      ],
    });

    return player.slot?.team.franchise;
  }

  async enableSubscription(): Promise<void> {
    if (this.subscribed) return;
    this.subscribed = true;
    await this.eventsService.subscribe(EventTopic.AllMemberEvents, true).then(rx => {
      rx.subscribe(v => {
        if (typeof v.payload !== 'object') {
          return;
        }

        const payload = { eventType: 0, ...v.payload };

        switch (v.topic as EventTopic) {
          case EventTopic.MemberRestrictionCreated:
            payload.eventType = 1;
            this.pubsub
              .publish(this.restrictedMembersSubTopic, { followRestrictedMembers: payload })
              .catch(this.logger.error.bind(this.logger));
            break;
          case EventTopic.MemberRestrictionExpired:
            payload.eventType = 2;
            this.pubsub
              .publish(this.restrictedMembersSubTopic, { followRestrictedMembers: payload })
              .catch(this.logger.error.bind(this.logger));
            break;
          default: {
            break;
          }
        }
      });
    });
  }

  async getMemberByUserIdAndOrganization(userId: number, organizationId: number): Promise<Member> {
    return this.memberRepository.findOneOrFail({
      where: {
        organizationId: organizationId,
        userId: userId,
      },
    });
  }
}

@Injectable()
export class MemberFixService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(MemberPlatformAccount)
    private memberPlatformAccountRepository: Repository<MemberPlatformAccount>,
    @InjectRepository(UserAuthenticationAccount)
    private userAuthRepository: Repository<UserAuthenticationAccount>,
    @InjectRepository(MLE_Player) private playerRepository: Repository<MLE_Player>,
    @InjectRepository(MLE_PlayerAccount)
    private playerAccountRepository: Repository<MLE_PlayerAccount>,
  ) {}

  async updateMemberAndPlayerIds(sprocketUserId: number, platformId: string) {
    return this.dataSource.transaction(async manager => {
      try {
        // 1. Get memberId from Member table where userId = sprocketUserId
        const member = await manager.findOne(Member, {
          where: { userId: sprocketUserId } as any,
        });
        if (!member) {
          throw new Error(`Member with userId ${sprocketUserId} not found`);
        }

        const memberId = member.id;

        // 2. Update MemberPlatformAccount where platformAccountId = platformId
        await manager.update(
          MemberPlatformAccount,
          { platformAccountId: platformId },
          { member: { id: memberId } },
        );

        // 3. Get accountId from UserAuthenticationAccount where userId = sprocketUserId
        const authAccount = await manager.findOne(UserAuthenticationAccount, {
          where: { user: { id: sprocketUserId } },
        });
        if (!authAccount) {
          throw new Error(`Auth account for userId ${sprocketUserId} not found`);
        }

        const discord_id = authAccount.accountId;

        // 4. Get 'id' from MLE_Player where discord_id = accountId
        const player = await manager.findOne(MLE_Player, {
          where: { discordId: discord_id } as any,
        });
        if (!player) {
          throw new Error(`MLE Player with discord_id ${discord_id} not found`);
        }

        const mlePlayerId = player.id;

        // 5. Update MLE_PlayerAccount: set playerId where platformId (in DB) = platformId (from user)
        await manager.update(
          MLE_PlayerAccount,
          { platformId: platformId },
          { player: { id: mlePlayerId } },
        );

        return {
          success: true,
          updatedMemberId: memberId,
          updatedPlayerId: mlePlayerId,
        };
      } catch (error) {
        // THROWING causes automatic rollback
        throw error;
      }
    });
  }
}
