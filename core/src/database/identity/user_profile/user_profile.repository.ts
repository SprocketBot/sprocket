import {Injectable} from "@nestjs/common";
import type { FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {UserProfile} from "./user_profile.model";

@Injectable()
export class UserProfileRepository extends ExtendedRepository<UserProfile> {
    constructor(readonly dataSource: DataSource) {
        super(UserProfile, dataSource);
    }

    async getByUserId(userId: number, options?: FindOneOptions<UserProfile>): Promise<UserProfile> {
        return this.findOneOrFail(Object.assign({where: {userId}}, options));
    }
}
