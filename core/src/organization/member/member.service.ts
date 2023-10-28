import {
    forwardRef,
    Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EventsService, EventTopic} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type {Franchise, IrrelevantFields} from "../../database";
import {
    Member, MemberProfile,
} from "../../database";
import {PlayerService} from "../../franchise/player/player.service";
import {UserService} from "../../identity/user/user.service";
import {MemberPubSub} from "../constants";
import {OrganizationService} from "../organization";

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
        let {profile} = await this.memberRepository.findOneOrFail({
            where: {id: memberId},
            relations: {profile: true},
        });
        profile = this.memberProfileRepository.merge(profile, data);
        await this.memberProfileRepository.save(profile);
        return profile;
    }

    async deleteMember(id: number): Promise<Member> {
        const toDelete = await this.memberRepository.findOneOrFail({
            where: {id},
            relations: {profile: true},
        });
        await this.memberRepository.delete({id});
        await this.memberProfileRepository.delete({id: toDelete.profile.id});
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

                const payload = {eventType: 0, ...v.payload};

                switch (v.topic as EventTopic) {
                    case EventTopic.MemberRestrictionCreated:
                        payload.eventType = 1;
                        this.pubsub.publish(this.restrictedMembersSubTopic, {followRestrictedMembers: payload}).catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.MemberRestrictionExpired:
                        payload.eventType = 2;
                        this.pubsub.publish(this.restrictedMembersSubTopic, {followRestrictedMembers: payload}).catch(this.logger.error.bind(this.logger));
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
                userId: userId
            }
        })
    }
}
