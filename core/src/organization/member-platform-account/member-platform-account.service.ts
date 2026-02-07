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
}
