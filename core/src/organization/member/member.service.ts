import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import type {FindManyOptions} from "typeorm/find-options/FindManyOptions";

import type {IrrelevantFields} from "../../database";
import {
    Member, MemberProfile,
} from "../../database";
import {OrganizationService} from "../organization";

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member) private memberRepository: Repository<Member>,
        @InjectRepository(MemberProfile) private memberProfileRepository: Repository<MemberProfile>,
        private organizationService: OrganizationService,
    ) {}

    async createMember(
        memberProfile: Omit<MemberProfile, IrrelevantFields | "id " | "member">,
        discordId: string,
        organizationId: number,
    ): Promise<Member> {
        const organization = await this.organizationService.getOrganizationById(organizationId);

        const profile = this.memberProfileRepository.create(memberProfile);
        const member = this.memberRepository.create({
            profile,
            discordId,
            organization,
        });

        await this.memberProfileRepository.save(profile);
        await this.memberRepository.save(member);

        return member;
    }

    async getMemberById(id: number): Promise<Member> {
        return this.memberRepository.findOneOrFail(id);
    }

    async getMembers(query: FindManyOptions<MemberProfile>): Promise<Member[]> {
        const memberProfiles = await this.memberProfileRepository.find(query);
        return memberProfiles.map(mp => mp.member);
    }

    async updateMemberProfile(memberId: number, data: Omit<Partial<MemberProfile>, "member">): Promise<MemberProfile> {
        let {profile} = await this.memberRepository.findOneOrFail(
            memberId,
            {relations: ["memberProfile"] },
        );
        profile = this.memberProfileRepository.merge(profile, data);
        await this.memberProfileRepository.save(profile);
        return profile;
    }

    async deleteMember(id: number): Promise<Member> {
        const toDelete = await this.memberRepository.findOneOrFail(id, {
            relations: ["memberProfile"],
        });
        await this.memberRepository.delete({id});
        await this.memberProfileRepository.delete({id: toDelete.profile.id});
        return toDelete;
    }
}
