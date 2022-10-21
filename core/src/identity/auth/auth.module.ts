import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {AnalyticsModule, config} from "@sprocketbot/common";

import {DatabaseModule} from "../../database";
import {FranchiseModule} from "../../franchise/franchise.module";
import {GameModule} from "../../game";
import {MledbInterfaceModule} from "../../mledb";
import {OrganizationModule} from "../../organization";
import {IdentityModule} from "../identity.module";
import {GqlJwtGuard} from "./gql-auth-guard";
import {
    DiscordStrategy, GoogleStrategy, JwtRefreshStrategy, JwtStrategy, OauthController, OauthService,
} from "./oauth";

@Module({
    imports: [
        DatabaseModule,
        IdentityModule,
        PassportModule,
        JwtModule.register({
            secret: config.auth.jwt_secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
        AnalyticsModule,
        forwardRef(() => MledbInterfaceModule),
        forwardRef(() => GameModule),
        forwardRef(() => FranchiseModule),
        forwardRef(() => OrganizationModule),
    ],
    providers: [GqlJwtGuard, OauthService, JwtStrategy, JwtRefreshStrategy, DiscordStrategy],
    exports: [OauthService],
    controllers: [OauthController],
})
export class AuthModule {}
