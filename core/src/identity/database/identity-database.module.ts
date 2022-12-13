import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {User} from "./user.entity";
import {UserProfiledRepository, UserRepository} from "./user.repository";
import {UserAuthenticationAccount} from "./user-authentication-account.entity";
import {UserAuthenticationAccountRepository} from "./user-authentication-account.repository";
import {UserPlatformAccount} from "./user-platform-account.entity";
import {UserPlatformAccountRepository} from "./user-platform-account.repository";
import {UserProfile} from "./user-profile.entity";
import {UserProfileRepository} from "./user-profile.repository";

const ormModule = TypeOrmModule.forFeature([UserAuthenticationAccount, UserProfile, User, UserPlatformAccount]);

const providers = [
    UserAuthenticationAccountRepository,
    UserProfileRepository,
    UserRepository,
    UserProfiledRepository,
    UserPlatformAccountRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class IdentityDatabaseModule {}
