import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
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
    ) {}

    async createMemberRestriction(
        type: MemberRestrictionType,
        expiration: Date,
        reason: string,
        memberId: number,
    ): Promise<MemberRestriction> {
        const member = await this.memberService.getMemberById(memberId);

        const memberRestriction = this.memberRestrictionRepository.create({
            type,
            reason,
            expiration,
            member,
        });

        await this.memberRestrictionRepository.save(memberRestriction);

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
        
        memberRestriction = this.memberRestrictionRepository.merge(memberRestriction, {manualExpiration, manualExpirationReason});
        await this.memberRestrictionRepository.save(memberRestriction);
        
        return memberRestriction;
    }
}
