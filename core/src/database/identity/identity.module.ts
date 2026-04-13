import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {User} from "./user";
import {UserAuthenticationAccount} from "./user_authentication_account";
import {UserOrgTeamPermission} from "./user_org_team_permission/user_org_team_permission.model";
import {UserProfile} from "./user_profile";

export const identityEntities = [User, UserProfile, UserAuthenticationAccount, UserOrgTeamPermission];

const ormModule = TypeOrmModule.forFeature(identityEntities);

@Module({
    imports: [ormModule],
    exports: [ormModule],
})
export class IdentityModule {}
