import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {MledbInterfaceModule} from "src/mledb/mledb-interface.module";

import {config} from "../../util/config";
import {IdentityModule} from "../identity.module";
import {AnonymousAuthService} from "./anonymous-auth/anonymous-auth.service";
import {AuthModuleResolver} from "./auth.mod.resolver";
import {GqlJwtGuard} from "./gql-auth-guard/gql-jwt-guard";
import {JwtConstants} from "./oauth/constants";
import {DiscordStrategy} from "./oauth/discord.strategy";
import {GoogleStrategy} from "./oauth/google.strategy";
import {OauthController} from "./oauth/oauth.controller";
import {JwtStrategy} from "./oauth/oauth.jwt.strategy";
import {OauthService} from "./oauth/oauth.service";

@Module({
    imports: [
        IdentityModule,
        PassportModule,
        JwtModule.register({
            secret: JwtConstants.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
        MledbInterfaceModule,
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
