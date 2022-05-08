import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

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
        memberId: number,
    ): Promise<MemberRestriction> {
        const member = await this.memberService.getMemberById(memberId);

        const memberRestriction = this.memberRestrictionRepository.create({
            type,
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

    async updateMemberRestriction(memberRestrictionId: number, data: Omit<Partial<MemberRestriction>, "member">): Promise<MemberRestriction> {
        let memberRestriction = await this.memberRestrictionRepository.findOneOrFail(memberRestrictionId);
        
        memberRestriction = this.memberRestrictionRepository.merge(memberRestriction, data);
        await this.memberRestrictionRepository.save(memberRestriction);
        
        return memberRestriction;
    }

    async deleteMemberRestriction(id: number): Promise<MemberRestriction> {
        const toDelete = await this.memberRestrictionRepository.findOneOrFail(id, {
            relations: ["memberRestrictionProfile"],
        });
        
        await this.memberRestrictionRepository.delete({id});

        return toDelete;
    }
}
