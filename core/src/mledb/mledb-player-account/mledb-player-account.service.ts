import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions} from "typeorm";
import {Repository} from "typeorm";

import {MLE_Platform, MLE_Player, MLE_PlayerAccount} from "../../database/mledb";

@Injectable()
export class MledbPlayerAccountService {
    constructor(@InjectRepository(MLE_PlayerAccount) private playerAccountRepository: Repository<MLE_PlayerAccount>) {}

    async getPlayerAccounts(query: FindManyOptions<MLE_PlayerAccount>): Promise<MLE_PlayerAccount[]> {
        return this.playerAccountRepository.find(query);
    }

    async createOrUpdatePlayerAccount(platform: MLE_Platform, tracker: string, platform_id: string, player: MLE_Player): Promise<void> {
        await this.playerAccountRepository.upsert([{
            platform: platform,
            tracker: tracker,
            platformId: platform_id,
            player: player
        }], ["tracker"])
    }
}
