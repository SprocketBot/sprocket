import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EventsService, EventTopic} from "@sprocketbot/common";
import type {
    FindConditions, FindManyOptions, FindOneOptions,
} from "typeorm";
import {
    IsNull, MoreThan, Repository,
} from "typeorm";

import type {MemberRestrictionType} from "../../database";
import {MemberRestriction} from "../../database";
import {MemberService} from "../member/member.service";

@Injectable()
export class MemberRestrictionService {
    constructor(
        @InjectRepository(MemberRestriction) private readonly memberRestrictionRepository: Repository<MemberRestriction>,
        private readonly memberService: MemberService,
        private readonly eventsService: EventsService,
    ) {}

    async createMemberRestriction(
        type: MemberRestrictionType,
        expiration: Date,
        reason: string,
        memberId: number,
    ): Promise<MemberRestriction> {
        const member = await this.memberService.getMemberById(memberId);

        const memberRestriction = this.memberRestrictionRepository.create({
            type: type,
            reason: reason,
            expiration: expiration.toUTCString(),
            member: member,
        });

        await this.memberRestrictionRepository.save(memberRestriction);

        // This is the message we'll send to the front end about the ban
        const eventPayload = {
            id: memberRestriction.id,
            eventType: 1,
            message: "Member restricted",
            restriction: memberRestriction,
        };
        await this.eventsService.publish(EventTopic.MemberRestrictionCreated, eventPayload);

        return memberRestriction;
    }

    async getMemberRestrictionById(id: number, options?: FindOneOptions<MemberRestriction>): Promise<MemberRestriction> {
        return this.memberRestrictionRepository.findOneOrFail(id, options);
    }

    async getMemberRestrictions(query: FindManyOptions<MemberRestriction>): Promise<MemberRestriction[]> {
        return this.memberRestrictionRepository.find(query);
    }

    async getActiveMemberRestrictions(type: MemberRestrictionType, date: Date = new Date(), memberId?: number): Promise<MemberRestriction[]> {
        const whereA: FindConditions<MemberRestriction> = {
            type: type,
            expiration: MoreThan(date),
            manualExpiration: IsNull(),
        };
        const whereB: FindConditions<MemberRestriction> = {
            type: type,
            manualExpiration: MoreThan(new Date()),
        };

        if (memberId) {
            whereA.member = {id: memberId};
            whereB.member = {id: memberId};
        }

        return this.memberRestrictionRepository.find({
            where: [whereA, whereB],
        });
    }

    async manuallyExpireMemberRestriction(memberRestrictionId: number, manualExpiration: Date, manualExpirationReason: string): Promise<MemberRestriction> {
        let memberRestriction = await this.memberRestrictionRepository.findOneOrFail(memberRestrictionId);

        memberRestriction = this.memberRestrictionRepository.merge(memberRestriction, {
            manualExpiration: manualExpiration.toUTCString(),
            manualExpirationReason: manualExpirationReason,
        });
        await this.memberRestrictionRepository.save(memberRestriction);

        // This is the message we'll send to the front end about the manual
        // expiration
        const eventPayload = {
            id: memberRestriction.id,
            eventType: 2,
            message: "Member restriction manually expired",
            restriction: memberRestriction,
        };

        await this.eventsService.publish(EventTopic.MemberRestrictionCreated, eventPayload);
        return memberRestriction;
    }
}
