import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../types/extended-repositories";
import {User} from "./user.entity";
import type {UserProfile} from "./user-profile.entity";
import {UserProfileRepository} from "./user-profile.repository";

@Injectable()
export class UserRepository extends ExtendedRepository<User> {
    constructor(readonly dataSource: DataSource) {
        super(User, dataSource);
    }
}

@Injectable()
export class UserProfiledRepository extends ProfiledRepository<User, UserProfile> {
    readonly profileInverseRelationshipName: "user";

    constructor(
        @Inject(UserRepository) readonly primaryRepository: UserRepository,
        @Inject(UserProfileRepository) readonly profileRepository: UserProfileRepository,
    ) {
        super();
    }
}
