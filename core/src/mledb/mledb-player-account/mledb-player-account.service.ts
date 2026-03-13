import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindManyOptions} from "typeorm";
import {EntityManager, Repository} from "typeorm";

import type {MLE_Platform, MLE_Player} from "../../database/mledb";
import {MLE_PlayerAccount} from "../../database/mledb";

@Injectable()
export class MledbPlayerAccountService {
    constructor(@InjectRepository(MLE_PlayerAccount)
    private playerAccountRepository: Repository<MLE_PlayerAccount>) {}

    async getPlayerAccounts(query: FindManyOptions<MLE_PlayerAccount>): Promise<MLE_PlayerAccount[]> {
        return this.playerAccountRepository.find(query);
    }

    async createOrUpdatePlayerAccount(
        updated_by_user_id: number,
        platform: MLE_Platform,
        tracker: string,
        platform_id: string,
        player: MLE_Player,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = manager ? manager.getRepository(MLE_PlayerAccount) : this.playerAccountRepository;
        await repo.upsert(
            [
                {
                    updatedBy: updated_by_user_id.toString(),
                    platform: platform,
                    tracker: tracker,
                    platformId: platform_id,
                    player: player,
                },
            ],
            ["platform", "platformId"],
        );
    }
}
