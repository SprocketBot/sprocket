import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import { AnalyticsModule } from "@sprocketbot/common";
import {MledbInterfaceModule} from "src/mledb/mledb-interface.module";

import {config} from "../../util/config";
import {IdentityModule} from "../identity.module";
import {AnonymousAuthService} from "./anonymous-auth/anonymous-auth.service";
import {AuthModuleResolver} from "./auth.mod.resolver";
import {GqlJwtGuard} from "./gql-auth-guard/gql-jwt-guard";
import {JwtConstants} from "./oauth/constants";
import {OauthController} from "./oauth/oauth.controller";
import {OauthService} from "./oauth/oauth.service";
import {DiscordStrategy} from "./oauth/strategies/discord.strategy";
import {GoogleStrategy} from "./oauth/strategies/google.strategy";
import {JwtStrategy} from "./oauth/strategies/oauth.jwt.strategy";

@Module({
    imports: [
        IdentityModule,
        PassportModule,
        JwtModule.register({
            secret: JwtConstants.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
        MledbInterfaceModule,
        AnalyticsModule
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
