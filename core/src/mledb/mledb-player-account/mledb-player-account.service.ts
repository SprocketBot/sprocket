import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions} from "typeorm";
import {Repository} from "typeorm";

import {MLE_PlayerAccount} from "../../database/mledb";

@Injectable()
export class MledbPlayerAccountService {
    constructor(@InjectRepository(MLE_PlayerAccount) private playerAccountRepository: Repository<MLE_PlayerAccount>) {}

    async getPlayerAccounts(query: FindManyOptions<MLE_PlayerAccount>): Promise<MLE_PlayerAccount[]> {
        return this.playerAccountRepository.find(query);
    }
}
