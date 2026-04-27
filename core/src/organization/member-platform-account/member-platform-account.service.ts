import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {EntityManager, Repository} from "typeorm";

import type {Member} from "$db/organization/member/member.model";
import {MemberPlatformAccount} from "$db/organization/member_platform_account/member_platform_account.model";

import {PlatformService} from "../../game/";

@Injectable()
export class MemberPlatformAccountService {
    constructor(
    @InjectRepository(MemberPlatformAccount)
    private memberPlatformAccountRepository: Repository<MemberPlatformAccount>,
    private platformService: PlatformService,
    ) {}

    async getMemberPlatformAccount(query: FindOneOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount> {
        return this.memberPlatformAccountRepository.findOneOrFail(query);
    }

    async getMemberPlatformAccountById(id: number): Promise<MemberPlatformAccount> {
        return this.memberPlatformAccountRepository.findOneOrFail({where: {id} });
    }

    async getMemberPlatformAccounts(query: FindManyOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount[]> {
        return this.memberPlatformAccountRepository.find(query);
    }

    async createMemberPlatformAccount(
        member: Member,
        platformId: number,
        platformAccountId: string,
        manager?: EntityManager,
    ): Promise<MemberPlatformAccount> {
        const platform = await this.platformService.getPlatformById(platformId, manager);
        const repo = manager ? manager.getRepository(MemberPlatformAccount) : this.memberPlatformAccountRepository;
        const memberPlatformAccount = repo.create({
            member,
            platform,
            platformAccountId,
        });

        await repo.save(memberPlatformAccount);

        return memberPlatformAccount;
    }

    /**
     * Idempotent link for the same member. The table is unique on `(platform, platformAccountId)` globally,
     * so if the platform id is already tied to another member we throw a controlled error instead of a DB
     * unique violation.
     */
    async upsertMemberPlatformAccount(
        member: Member,
        platformId: number,
        platformAccountId: string,
        manager?: EntityManager,
    ): Promise<MemberPlatformAccount> {
        const repo = manager ? manager.getRepository(MemberPlatformAccount) : this.memberPlatformAccountRepository;
        const globalExisting = await repo.findOne({
            where: {
                platform: {id: platformId},
                platformAccountId,
            },
            relations: {member: true, platform: true},
        });
        if (globalExisting) {
            if (globalExisting.member.id === member.id) {
                return globalExisting;
            }
            throw new Error(
                `Platform account ${platformAccountId} is already linked to member ${globalExisting.member.id}; `
                + `cannot attach to member ${member.id}`,
            );
        }
        return this.createMemberPlatformAccount(member, platformId, platformAccountId, manager);
    }
}
