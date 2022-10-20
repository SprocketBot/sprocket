import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ProfiledRepository} from "../../extended-repositories";
import {ExtendedRepository} from "../../extended-repositories/repository";
import type {UserProfile} from "../models";
import {UserProfileRepository} from "../user_profile/user_profile.repository";
import {User} from "./user.model";

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
