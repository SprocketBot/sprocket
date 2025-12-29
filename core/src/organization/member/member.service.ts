import {
    forwardRef,
    Inject, Injectable, Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventsService, EventTopic } from "@sprocketbot/common";
import { PubSub } from "apollo-server-express";
import type { FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import type { Franchise } from "../../database/franchise/franchise/franchise.model";
import {IrrelevantFields} from '../../database';;;;
import { Member } from "../../database/organization/member/member.model";
import { MemberProfile } from "../../database/organization/member_profile/member_profile.model";
import { PlayerService } from "../../franchise/player/player.service";
import { UserService } from "../../identity/user/user.service";
import { MemberPubSub } from "../constants";
import { OrganizationService } from "../organization";

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
    ) { }

    get restrictedMembersSubTopic(): string { return "member.restricted" }

    async createMember(
        memberProfile: Omit<MemberProfile, IrrelevantFields | "id" | "member">,
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

    async updateMemberProfile(memberId: number, data: Omit<Partial<MemberProfile>, "member">): Promise<MemberProfile> {
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

    async getFranchiseByMember(memberId: number, organizationId: number, gameId: number): Promise<Franchise | undefined> {
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
                "member",
                "member.user",
                "member.organization",
                "skillGroup",
                "skillGroup.game",
                "slot",
                "slot.team",
                "slot.team.franchise",
            ],
        });

        return player.slot?.team.franchise;
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllMemberEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }

                const payload = { eventType: 0, ...v.payload };

                switch (v.topic as EventTopic) {
                    case EventTopic.MemberRestrictionCreated:
                        payload.eventType = 1;
                        this.pubsub.publish(this.restrictedMembersSubTopic, { followRestrictedMembers: payload }).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.MemberRestrictionExpired:
                        payload.eventType = 2;
                        this.pubsub.publish(this.restrictedMembersSubTopic, { followRestrictedMembers: payload }).catch(this.logger.error.bind(this.logger));
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

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MemberFixService {
  constructor(private dataSource: DataSource) {}

  async updateMemberAndPlayerIds(sprocketUserId: string, platformId: string) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // 1. Find the member record from userId
        const member = await manager.query(
          `SELECT id FROM sprocket.member WHERE "userId" = $1`,
          [sprocketUserId]
        );
        if (!member.length) throw new Error('Sprocket member not found');
        const memberId = member[0].id;

        // 2. Get Discord ID from user_authentication_account
        const uaa = await manager.query(
          `SELECT "accountId" FROM sprocket.user_authentication_account WHERE "userId" = $1`,
          [sprocketUserId]
        );
        if (!uaa.length) throw new Error('User authentication account not found');
        const discordId = uaa[0].accountId;

        // 3. Get playerId from mledb.player
        const player = await manager.query(
          `SELECT id FROM mledb.player WHERE discord_id = $1`,
          [discordId]
        );
        if (!player.length) throw new Error('Player not found in mledb');
        const playerId = player[0].id;

        // 4. Update member_platform_account
        await manager.query(
          `UPDATE sprocket.member_platform_account
           SET "memberId" = $1
           WHERE "platformAccountId" = $2`,
          [memberId, platformId]
        );

        // 5. Update player_account
        await manager.query(
          `UPDATE mledb.player_account
           SET player_id = $1
           WHERE platform_id = $2`,
          [playerId, platformId]
        );

        return { success: true, playerId, memberId };
      } catch (error) {
        throw error; // transaction rollback automatically
      }
    });
  }
}