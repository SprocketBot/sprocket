import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
//import {readFileSync} from "fs";
//import type {VerifyCallback} from "passport-discord-oauth20";
import {Profile, Strategy} from "passport-discord";
import {UserAuthenticationAccountType} from "src/database";
import {User} from "src/database/identity/user/user.model";
import {UserService} from "src/identity/user/user.service";

import {config} from "../../../util/config";
import type {DiscordProfileType} from "./types/profile.type";

export type Done = (err: Error, user: User) => void;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {

    constructor(private readonly userService: UserService) {
        super({
            clientID: config.auth.discordClientId,
            clientSecret: config.auth.discordSecret,
            callbackURL: config.auth.discordCallbackURL,
            scope: ["identify", "email", "guilds", "guilds.members.read"],
        });
    }

    async validate(
        accessToken: string, 
        refreshToken: string, 
        profile: Profile, 
        done: Done): Promise<User | undefined> {
        
        const {id: discordId, email, discriminator, username, avatar } = profile;

        // First, check if the user already exists
        const queryResult = await this.userService.getUsers({where: {email: email} });

        let user = new User();
        // If no users returned from query, create a new one
        if (queryResult.length === 0) {
            const userProfile = {
                description: "",
                email: profile.emails[0].value,
                firstName: username,
                lastName: "",
            };

            const authAcct = {
                accountType: UserAuthenticationAccountType.discord,
                accountId: discordId,
                oauthToken: accessToken,
            };
            user = await this.userService.createUser(userProfile, [authAcct]);
        } else {
        // Else, return the one we found
            user = queryResult[0];
        }
        done(null, user);
        return user;
    }
}
