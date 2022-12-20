import {Injectable} from "@nestjs/common";
import type {FindOneOptions} from "typeorm";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {UserProfile} from "./user-profile.entity";

@Injectable()
export class UserProfileRepository extends ExtendedRepository<UserProfile> {
    constructor(readonly dataSource: DataSource) {
        super(UserProfile, dataSource);
    }

    async getByUserId(userId: number, options?: FindOneOptions<UserProfile>): Promise<UserProfile> {
        return this.findOneOrFail(Object.assign({where: {userId}}, options));
    }
}
