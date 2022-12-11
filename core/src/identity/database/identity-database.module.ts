import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {User} from "./user.entity";
import {UserRepository} from "./user.repository";
import {UserAuthenticationAccount} from "./user-authentication-account.entity";
import {UserAuthenticationAccountRepository} from "./user-authentication-account.repository";
import {UserProfile} from "./user-profile.entity";
import {UserProfileRepository} from "./user-profile.repository";

const ormModule = TypeOrmModule.forFeature([UserAuthenticationAccount, UserProfile, User]);

const providers = [UserAuthenticationAccountRepository, UserProfileRepository, UserRepository];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class IdentityDatabaseModule {}
