import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {MemberPlatformAccount} from "../../database";
import {PlatformService} from "../../game/";
import {MemberService} from "../member/";

@Injectable()
export class MemberPlatformAccountService {
    constructor(
        @InjectRepository(MemberPlatformAccount) private memberPlatformAccountRepository: Repository<MemberPlatformAccount>,
        private memberService: MemberService,
        private platformService: PlatformService,
    ) {}

    async getMemberPlatformAccount(query: FindOneOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount> {
        return this.memberPlatformAccountRepository.findOneOrFail(query);
    }
    
    async getMemberPlatformAccountById(id: number): Promise<MemberPlatformAccount> {
        return this.memberPlatformAccountRepository.findOneOrFail(id);
    }

    async getMemberPlatformAccounts(query: FindManyOptions<MemberPlatformAccount>): Promise<MemberPlatformAccount[]> {
        return this.memberPlatformAccountRepository.find(query);
    }

    async createMemberPlatformAccount(memberId: number, platformId: number, platformAccountId: string): Promise<MemberPlatformAccount> {
        const member = await this.memberService.getMemberById(memberId);
        const platform = await this.platformService.getPlatformById(platformId);
        const memberPlatformAccount = this.memberPlatformAccountRepository.create({
            member, platform, platformAccountId,
        });

        await this.memberPlatformAccountRepository.save(memberPlatformAccount);

        return memberPlatformAccount;
    }
}
