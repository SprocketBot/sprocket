import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindConditions} from "typeorm";
import {Repository} from "typeorm";

import {MemberPlatformAccount} from "../../database";
import {PlatformService} from "../../game/platform/platform.service";
import {MemberService} from "../member/member.service";

@Injectable()
export class MemberPlatformAccountService {
    constructor(
        @InjectRepository(MemberPlatformAccount) private memberPlatformAccountRepository: Repository<MemberPlatformAccount>,
        private memberService: MemberService,
        private platformService: PlatformService,
    ) {}
    
    async getMemberPlatformAccountById(id: number): Promise<MemberPlatformAccount> {
        return this.memberPlatformAccountRepository.findOneOrFail(id);
    }

    async getMemberPlatformAccounts(query: FindConditions<MemberPlatformAccount>): Promise<MemberPlatformAccount[]> {
        return this.memberPlatformAccountRepository.find({
            where: query,
        });
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
