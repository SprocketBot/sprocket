import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {Profile} from "passport-discord";
import {Strategy} from "passport-discord";
import type {VerifyCallback} from "passport-oauth2";

import type {User} from "$models";
import {UserAuthenticationAccountRepository} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
    constructor(private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository) {
        super({
            clientID: config.auth.discord.clientId,
            clientSecret: config.auth.discord.secret,
            callbackURL: config.auth.discord.callbackURL,
            scope: ["identify", "email"],
            prompt: "none",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<User | undefined> {
        const userAcc = await this.userAuthenticationAccountRepository.getOrNull({
            where: {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
            },
            relations: {user: true},
        });

        if (!userAcc) {
            done(new UnauthorizedException("User not found"));
            return undefined;
        }

        done(null, userAcc.user);
        return userAcc.user;
    }
}
