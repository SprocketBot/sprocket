import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import type {IrrelevantFields} from "../../database";
import {
    Member, MemberProfile,
} from "../../database";
import {UserService} from "../../identity/user/user.service";
import {OrganizationService} from "../organization";

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member) private memberRepository: Repository<Member>,
        @InjectRepository(MemberProfile) private memberProfileRepository: Repository<MemberProfile>,
        private readonly organizationService: OrganizationService,
        private readonly userService: UserService,
    ) {}

    async createMember(
        memberProfile: Omit<MemberProfile, IrrelevantFields | "id " | "member">,
        organizationId: number,
        userId: number,
    ): Promise<Member> {
        const organization = await this.organizationService.getOrganizationById(organizationId);
        const user = await this.userService.getUserById(userId);

        const profile = this.memberProfileRepository.create(memberProfile);
        const member = this.memberRepository.create({
            profile,
            organization,
            user,
        });

        await this.memberProfileRepository.save(profile);
        await this.memberRepository.save(member);

        return member;
    }

    async getMember(query: FindOneOptions<Member>): Promise<Member> {
        return this.memberRepository.findOneOrFail(query);
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
