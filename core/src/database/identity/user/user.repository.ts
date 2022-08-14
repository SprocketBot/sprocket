import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {BaseRepository} from "../../base-repository";
import {ProfiledRepository} from "../../profiled-repository";
import {UserProfile} from "../user_profile";
import {User} from "./user.model";

@Injectable()
export class UserPrimaryRepository extends BaseRepository<User> {
    constructor(readonly dataSource: DataSource) {
        super(User, dataSource);
    }
}

@Injectable()
export class UserProfileRepository extends BaseRepository<UserProfile> {
    constructor(readonly dataSource: DataSource) {
        super(UserProfile, dataSource);
    }
}

@Injectable()
export class UserRepository extends ProfiledRepository<User, UserProfile> {
    readonly profileInverseRelationshipName = "user";

    constructor(
        @Inject(UserPrimaryRepository) readonly primaryRepository: UserPrimaryRepository,
        @Inject(UserProfileRepository) readonly profileRepository: UserProfileRepository,
    ) {
        super();
    }
}
