import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {config} from "@sprocketbot/common";

import {IdentityDatabaseModule} from "../identity/database/identity-database.module";
import {OrganizationDatabaseModule} from "../organization/database/organization-database.module";
import {AuthenticationController} from "./authentication.controller";
import {AuthenticationResolver} from "./authentication.resolver";
import {AuthenticationService} from "./authentication.service";
import {DiscordStrategy} from "./strategies/discord/discord.strategy";
import {EpicStrategy} from "./strategies/epic/epic.strategy";
import {GoogleStrategy} from "./strategies/google/google.strategy";
import {JwtStrategy} from "./strategies/jwt/jwt.strategy";
import {MicrosoftStrategy} from "./strategies/microsoft/microsoft.strategy";
import {SteamStrategy} from "./strategies/steam/steam.strategy";
import {XboxStrategy} from "./strategies/xbox/xbox.strategy";

@Module({
    imports: [
        IdentityDatabaseModule,
        OrganizationDatabaseModule,
        PassportModule.register({session: false}),
        JwtModule.register({
            secret: config.auth.jwt.secret,
            signOptions: {expiresIn: config.auth.jwt_expiry},
        }),
    ],
    providers: [
        AuthenticationResolver,
        AuthenticationService,
        DiscordStrategy,
        EpicStrategy,
        GoogleStrategy,
        JwtStrategy,
        SteamStrategy,
        MicrosoftStrategy,
        XboxStrategy,
    ],
    controllers: [AuthenticationController],
})
export class AuthenticationModule {}
