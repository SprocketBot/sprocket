import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {AnalyticsModule} from "@sprocketbot/common";

import {MledbInterfaceModule} from "../../mledb";
import {config} from "../../util/config";
import {IdentityModule} from "../identity.module";
import {AnonymousAuthService} from "./anonymous-auth";
import {AuthModuleResolver} from "./auth.mod.resolver";
import {GqlJwtGuard} from "./gql-auth-guard";
import {
    DiscordStrategy, GoogleStrategy, JwtConstants, JwtStrategy, OauthController, OauthService,
} from "./oauth";

@Module({
    imports: [
        IdentityModule,
        PassportModule,
        JwtModule.register({
            secret: JwtConstants.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
        MledbInterfaceModule,
        AnalyticsModule,
    ],
    providers: [
        AuthModuleResolver,
        AnonymousAuthService,
        GqlJwtGuard,
        OauthService,
        JwtStrategy,
        GoogleStrategy,
        DiscordStrategy,
    ],
    exports: [OauthService],
    controllers: [OauthController],

})
export class AuthModule {}
