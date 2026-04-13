import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {config} from "@sprocketbot/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {UserOrgTeamPermission} from "$db/identity/user_org_team_permission/user_org_team_permission.model";

import {DatabaseModule} from "../database";
import {MledbInterfaceModule} from "../mledb";
import {UtilModule} from "../util/util.module";
import {IdentityController} from "./identity.controller";
import {IdentityService} from "./identity.service";
import {OrgTeamPermissionResolutionService} from "./user-org-team-permission/org-team-permission-resolution.service";
import {UserOrgTeamPermissionService} from "./user-org-team-permission/user-org-team-permission.service";
import {UserOrgTeamPermissionResolver} from "./user-org-team-permission/user-org-team-permission.resolver";
import {
    UserController, UserResolver, UserService,
} from "./user";
import {UserAuthenticationAccountResolver} from "./user-authentication-account";

@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([UserOrgTeamPermission]),
        forwardRef(() => MledbInterfaceModule),
        UtilModule,
        JwtModule.register({
            secret: config.auth.jwt_secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
    ],
    providers: [
        IdentityService,
        UserResolver,
        UserAuthenticationAccountResolver,
        UserService,
        UserOrgTeamPermissionService,
        UserOrgTeamPermissionResolver,
        OrgTeamPermissionResolutionService,
    ],
    exports: [IdentityService, UserService, UserOrgTeamPermissionService, OrgTeamPermissionResolutionService],
    controllers: [IdentityController, UserController],
})
export class IdentityModule {}
